import Node from './Node';
import RootNode from './RootNode';
import wrapFunc from './wrapFunc';

const TITLE_REG_EXP = /(<title.*?>)([\S\s]*?)(<\/title>)/;
const BODY_REG_EXP = /(<body.*?>)([\S\s]*?)(<\/body>)/;

export default class Generator {
  body: Node;
  title: Node;
  root: RootNode;
  private outerHTML: string;
  constructor(initialHTML: any) {
    this.outerHTML = initialHTML;

    this.body = new Node(initialHTML, 'body', BODY_REG_EXP);

    this.outerHTML = this.outerHTML.replace(/<body([\S\s]*?)>/, (match, p1) => {
      return "<body" + this.body.attributePlaceholder + p1 + ">"
    });

    this.title = new Node(initialHTML, 'title', TITLE_REG_EXP, {
      prependPlaceholder: '__HTML_GENERATOR_TITLE_PREPEND__',
      placeholder: '__HTML_GENERATOR_TITLE__',
      appendPlaceholder: '__HTML_GENERATOR_TITLE_APPEND__',
    });
    this.outerHTML = this.title.setPlaceholder(this.outerHTML);

    this.root = new RootNode({
      prependPlaceholder: '<!--__BEFORE_ROOT__-->',
      placeholder: '<!--__INNER_ROOT__-->',
      appendPlaceholder: '<!--__AFTER_ROOT__-->',
    });
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

  getInsertedMetas(): string[] {
    return this.title.insertedBeforeElements;
  }

  getInsertedLinks(): string[] {
    return this.title.insertedAfterElements;
  }

  getInsertedScripts(): string[] {
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
