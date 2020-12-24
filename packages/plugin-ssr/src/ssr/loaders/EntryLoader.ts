import { formatPath } from '@builder/app-helpers';

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

    import { getAppConfig } from '${this.absoluteAppConfigPath}'
    import Page from '${this.entryPath}';
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
      const html = await renderComponentToHTML(Page, {
        req,
        res
      });
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
