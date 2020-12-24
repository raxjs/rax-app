export default class {
  source = '';
  absoluteAppConfigPath: string;
  entryPath: string;
  constructor({ absoluteAppConfigPath, entryPath }) {
    this.absoluteAppConfigPath = absoluteAppConfigPath;
    this.entryPath = entryPath;
  }

  addInitImport() {
    this.source += `
    import { createElement } from 'rax';
    import renderer from 'rax-server-renderer';
    import * as queryString from 'query-string';

    import { getAppConfig } from '${this.absoluteAppConfigPath}'
    import Page from '${this.entryPath}';

    const parseurl = require('parseurl');
    `;
    return this;
  }

  addVariableDeclaration() {
    this.source += `
    const appConfig = getAppConfig() || {};
    `;
    return this;
  }

  addRender() {
    this.source += `
    async function render(req, res) {
      const html = await renderToHTML(req, res);

      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.send(html);
    }`;
    return this;
  }
  addRenderToHTML() {
    this.source += `
    async function renderToHTML(req, res) {
      const { search, hash, path, pathname } = parseurl(req);
      const parsedQuery = queryString.parse(search);
      const initialContext = {
        req,
        res,
        pathname,
        query: parsedQuery,
        path,
        location: { pathname, search, hash, state: null }
      }
      const html = await renderComponentToHTML(Page, initialContext);
      return html;
    }`;
    return this;
  }

  addRenderWithContext() {
    this.source += `
    // Handler for Midway FaaS and Koa
    async function renderWithContext(ctx) {
      const html = await renderComponentToHTML(Page, ctx);

      ctx.set('Content-Type', 'text/html; charset=utf-8');
      ctx.body = html;
    }`;
    return this;
  }

  addExport() {
    this.source += `
    export {
      render,
      renderToHTML,
      renderWithContext
    };

    export default render;
    `;
    return this;
  }

  addGetInitialProps() {
    this.source += `
    async function getInitialProps(Component, ctx) {
      if (!Component.getInitialProps) return null;

      const props = await Component.getInitialProps(ctx);

      if (!props || typeof props !== 'object') {
        const message = '"getInitialProps()" should resolve to an object. But found "' + props + '" instead.';
        throw new Error(message);
      }

      return props;
    }`;
    return this;
  }

  getSource() {
    return this.source;
  }
}
