import { formatPath } from '@builder/app-helpers';
import * as qs from 'qs';
import * as path from 'path';
import { ILoaderQuery } from '../types';
import addCustomRenderComponentToHTML from './addCustomRenderComponentToHTML';
import addBuiltInRenderComponentToHTML from './addBuiltInRenderComponentToHTML';

function addExport(code) {
  return `${code}
  export {
    render,
    renderToHTML,
    renderWithContext,
    renderToHTMLWithContext
  };`;
}

function addDefineInitialPage() {
  return `
  const pathname = req.path;
  let Page = appConfig.renderComponent;
  if (!Page) {
    const routes = staticConfig.routes;
    const route = routes.find(({ path }) => path === pathname);
    Page = route.component();
    Page.__pageConfig = route;
  }
  `;
}

/**
 * Global variables:
 * utils: Generator
 * rax render: createElement/renderer
 * Component: Page/Document
 * generated in .rax: appConfig/staticConfig/createBaseApp/emitLifeCycles
 * MPA: pageConfig
 */
export default function () {
  const query = (qs.parse(this.query.substr(1)) as unknown) as ILoaderQuery;
  const corePath = path.join(query.tempPath, 'core');
  query.needInjectStyle = query.needInjectStyle === 'true';
  query.updateDataInClient = query.updateDataInClient === 'true';
  let code = `
    import Generator from '@builder/html-generator';
    import { createElement } from 'rax';
    import { getAppConfig } from '${formatPath(path.join(corePath, 'appConfig'))}';
    import { emitLifeCycles } from '${formatPath(path.join(corePath, 'publicAPI'))}';
    import '${formatPath(this.resourcePath)}';
    import app from '${formatPath(query.runAppPath)}';

    const { createBaseApp, staticConfig, pageConfig, TabBar } = app;

    const appConfig = getAppConfig() || {};

    async function getInitialProps(Component, ctx) {
      if (!Component.getInitialProps) return null;
      const props = await Component.getInitialProps(ctx);
      // null will be return as page component initial props
      if (typeof props === 'object') {
        return props;
      }
      const message = '"getInitialProps()" should resolve to an object. But found "' + props + '" instead.';
      throw new Error(message);
    }

    ${query.documentPath ? addCustomRenderComponentToHTML(query) : addBuiltInRenderComponentToHTML(query)}

    async function renderToHTML(req, res, options = {}) {
      const { initialData, htmlTemplate, chunkInfo } = options;
      ${addDefineInitialPage()}
      const html = await renderComponentToHTML(Page, { req, res }, initialData, htmlTemplate, chunkInfo);
      return html;
    }

    async function renderToHTMLWithContext(ctx, options = {}) {
      const { initialData, htmlTemplate, chunkInfo } = options;
      ${addDefineInitialPage()}
      const html = await renderComponentToHTML(Page, ctx, initialData, htmlTemplate, chunkInfo);
      return html;
    }

    async function renderWithContext(ctx, options = {}) {
      const { res, req } = ctx;
      const { initialData, htmlTemplate } = options;
      ${addDefineInitialPage()}
      let html;
      try {
        html = await renderComponentToHTML(Page, ctx, initialData);
      } catch (e) {
        html = htmlTemplate;
        console.error(e);
      }
      ctx.set('Content-Type', 'text/html; charset=utf-8');
      ctx.body = html;
    }

    async function render(ctx, options) {
      let html;
      if (ctx.req) {
        const { initialData, htmlTemplate, chunkInfo } = options;
        try {
          html = await renderToHTML(ctx.req, ctx.res, { initialData, htmlTemplate, chunkInfo });
        } catch (e) {
          html = htmlTemplate;
          console.error(e);
        }
      } else {
        const [req, res] = [...arguments];
        ctx = { req, res };
        html = await renderToHTML(ctx.req, ctx.res);
      }

      ctx.res.setHeader('Content-Type', 'text/html; charset=utf-8');
      ctx.res.send(html);
    }
  `;

  if (query.documentPath) {
    code = `import Document from '${formatPath(query.documentPath)}';
    ${code}`;
  }

  return addExport(code);
}
