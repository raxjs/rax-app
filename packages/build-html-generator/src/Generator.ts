import { IGeneratorOptions } from './types';
import Node from './Node';
import wrapFunc from './wrapFunc';

const TITLE_REG_EXP = /(<title.*?>)([\S\s]*?)(<\/title>)/;
const BODY_REG_EXP = /(<body.*?>)([\S\s]*?)(<\/body>)/;

export default class Generator {
  body: Node;
  title: Node;
  root: Node;
  private outerHTML: string;
  constructor(initialHTML: any, generatorOptions?: IGeneratorOptions) {
    const { rootId = 'root' } = generatorOptions || {};
    this.outerHTML = initialHTML;

    this.body = new Node(initialHTML, 'body', BODY_REG_EXP);
    this.outerHTML = this.outerHTML.replace(/<body([\S\s]*?)>/, `<body${this.body.attributePlaceholder}>`);

    this.title = new Node(initialHTML, 'title', TITLE_REG_EXP, {
      prependPlaceholder: '__HTML_GENERATOR_TITLE_PREPEND__',
      placeholder: '__HTML_GENERATOR_TITLE__',
      appendPlaceholder: '__HTML_GENERATOR_TITLE_APPEND__',
    });
    this.outerHTML = this.title.setPlaceholder(this.outerHTML);

    this.root = new Node(initialHTML, 'div', new RegExp(`(<div.*id="${rootId}".*?>)([\\S\\s]*)(</div>)`), {
      prependPlaceholder: '__HTML_GENERATOR_ROOT_NODE_PREPEND__',
      placeholder: '__HTML_GENERATOR_ROOT_NODE__',
      appendPlaceholder: '__HTML_GENERATOR_ROOT_NODE_APPEND__',
    });
    this.outerHTML = this.root.setPlaceholder(this.outerHTML);
  }
  insertMeta(metas: string | string[]) {
    this.title.insertBefore(metas);
  }

  insertLink(links: string | string[]) {
    this.title.insertAfter(links);
  }

  insertScript(scripts: string | string[]) {
    this.root.insertAfter(scripts);
  }

  insertedMetas(): string[] {
    return this.title.insertedBeforeElements;
  }

  insertedLinks(): string[] {
    return this.title.insertedAfterElements;
  }

  insertedScripts(): string[] {
    return this.root.insertedAfterElements;
  }

  html() {
    return wrapFunc(
      this.outerHTML,
      this.root.generate.bind(this.root),
      this.title.generate.bind(this.title),
      this.body.generate.bind(this.body),
    );
  }
}
