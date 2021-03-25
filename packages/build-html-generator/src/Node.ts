import { IPlaceholderOptions } from './types';
import wrapFunc from './wrapFunc';
import BaseNode from './BaseNode';

let count = 0;

export default class Node extends BaseNode {
  tagName: string;
  attributes = '';
  attributePlaceholder: string;
  __outerHTML = '';
  private nodeId: string;
  private initInnerHTML = '';
  private initOuterHTML = '';
  private matchRegExp: RegExp;
  private matched = false;
  constructor(html: string, tagName: string, matchRegx: RegExp, placeholderOptions?: IPlaceholderOptions) {
    super(placeholderOptions);
    this.nodeId = `${tagName.toUpperCase()}_${++count}`;
    this.tagName = tagName;
    this.matchRegExp = matchRegx;

    let matchedHTML;
    html.replace(matchRegx, (match, front, innerHTML, end) => {
      this.innerHTML = innerHTML;
      if (placeholderOptions) {
        this.initInnerHTML = `__${this.nodeId}_INNER_HTML__`;
      } else {
        this.initInnerHTML = innerHTML;
      }
      matchedHTML = `${front}${this.initInnerHTML}${end}`;

      return matchedHTML;
    });

    if (!matchedHTML) return;
    this.matched = true;
    const attributesMatched = matchedHTML.match(new RegExp(`<${tagName}(\\S\s*?)>`));
    this.attributes = (attributesMatched && attributesMatched[1]) || '';
    this.attributePlaceholder = `${this.nodeId}_ATTRIBUTES`;
    this.initOuterHTML = this.attributes
      ? matchedHTML.replace(this.attributes, this.attributePlaceholder)
      : matchedHTML.replace(new RegExp(`<${tagName}`), `<${tagName}${this.attributePlaceholder}`);
  }

  get outerHTML(): string {
    if (!this.matched) return '';
    return (
      this.__outerHTML ||
      this.initOuterHTML
        .replace(`${this.nodeId}_ATTRIBUTES`, this.attributes ? ` ${this.attributes}` : '')
        .replace(this.initInnerHTML, this.innerHTML)
    );
  }

  setPlaceholder(html: string): string {
    const { prependPlaceholder, placeholder, appendPlaceholder } = this.placeholderOptions || {};
    return html.replace(
      this.matchRegExp,
      wrapFunc(
        '',
        this.addPlaceholder.bind(this, prependPlaceholder),
        this.addPlaceholder.bind(this, placeholder),
        this.addPlaceholder.bind(this, appendPlaceholder),
      ),
    );
  }

  generate(html: string): string {
    if (this.placeholderOptions) {
      const { prependPlaceholder, placeholder, appendPlaceholder } = this.placeholderOptions;
      return wrapFunc(
        html,
        this.replacePlaceholder.bind(this, prependPlaceholder, this.insertedBeforeElements.join('\n')),
        this.replacePlaceholder.bind(this, placeholder, this.outerHTML),
        this.replacePlaceholder.bind(this, appendPlaceholder, this.insertedAfterElements.join('\n')),
      );
    } else {
      return html.replace(`${this.nodeId}_ATTRIBUTES`, this.attributes ? ` ${this.attributes}` : '');
    }
  }

  html(...args) {
    if (args.length > 0) {
      this.__outerHTML = args[0];
    }
    return this.outerHTML;
  }

  private addPlaceholder(value, placeholder) {
    if (value) {
      return `${placeholder}${value}`;
    }
    return placeholder;
  }
}
