import { formatPath } from '@builder/app-helpers';
import { parse } from 'query-string';
import * as path from 'path';
import { IFormattedLoaderQuery, ILoaderQuery } from '../types';
import addCustomRenderComponentToHTML from './addCustomRenderComponentToHTML';
import addBuiltInRenderComponentToHTML from './addBuiltInRenderComponentToHTML';
import formatEntryLoaderQuery from '../utils/formatEntryLoaderQuery';

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
  let Page;
  if (enableRouter) {
    const route = staticConfig.routes.find(({ path }) => path === pathname);
    Page = route.component();
  } else {
    Page = appConfig.app && appConfig.app.renderComponent;
  }
  `;
}

function addImportSource(source, exportPageComponent: boolean): string {
  if (exportPageComponent) {
    return `import PageComponent from '${formatPath(source)}';`;
  }

  return `import '${formatPath(source)}';`;
}

function addExecuteRunApp(exportPageComponent: boolean): string {
  if (exportPageComponent) {
    return `runApp({
      app: {
        renderComponent: PageComponent,
      }
    });`;
  }

  return '';
}

/**
 * Global variables:
 * utils: Generator, parseUrl
 * rax render: createElement/renderer
 * Component: Document/PageComponent
 * generated in .rax: appConfig/staticConfig/createBaseApp/emitLifeCycles/setHistory/enableRouter
 * MPA: pageConfig
 */
export default function () {
  const query = parse(this.query) as unknown as ILoaderQuery;
  const formattedQuery: IFormattedLoaderQuery = formatEntryLoaderQuery(query);
  const corePath = path.join(query.tempPath, 'core');

  let code = `
    import Generator from '@builder/html-generator';
    import { createElement } from 'rax';
    import renderer from 'rax-server-renderer';
    import * as parseUrl from 'parse-url';
    import { getAppConfig } from '${formatPath(path.join(corePath, 'appConfig'))}';
    import { emitLifeCycles } from '${formatPath(path.join(corePath, 'publicAPI'))}';
    import { setHistory } from '${formatPath(path.join(corePath, 'routerAPI'))}';
    ${addImportSource(this.resourcePath, formattedQuery.exportPageComponent)}
    import app, { runApp } from '${formatPath(formattedQuery.runAppPath)}';

    ${addExecuteRunApp(formattedQuery.exportPageComponent)}

    const { createBaseApp, staticConfig, pageConfig, TabBar, enableRouter } = app;

    const escapeLookup = {
      '<': '\\u003c',
      '>': '\\u003e',
      '/': '\\u002f',
    };

    const escapeRegex = /[<>\/]/g;
    function stripXSS(str) {
      return str.replace(escapeRegex, (match) => escapeLookup[match]);
    }

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

    function getInitialContext(ctx) {
      const { req, res } = ctx;

      // 某些调用环境 mock 的 request 上不存在 url 字段
      if (!req.url) {
        return ctx;
      }

      const { hash, search, query } = parseUrl(req.url);
      const pathname = req.path;
      const location = {
        pathname,
        search,
        state: null,
        hash,
      };

      return {
        pathname,
        query,
        location,
        ...ctx,
      };
    }

    ${formattedQuery.documentPath ? addCustomRenderComponentToHTML(formattedQuery) : addBuiltInRenderComponentToHTML(formattedQuery)}

    async function renderToHTML(req, res, options = {}) {
      const { initialData, htmlTemplate } = options;
      ${addDefineInitialPage()}
      const html = await renderComponentToHTML(Page, getInitialContext({ req, res }), initialData);
      return html;
    }

    async function renderToHTMLWithContext(ctx, options = {}) {
      const { req, res } = ctx;
      const { initialData, htmlTemplate } = options;
      ${addDefineInitialPage()}
      const html = await renderComponentToHTML(Page, getInitialContext(ctx), initialData, htmlTemplate);
      return html;
    }

    async function renderWithContext(ctx, options = {}) {
      const { res, req } = ctx;
      const { initialData, htmlTemplate } = options;
      ${addDefineInitialPage()}
      let html;
      try {
        html = await renderComponentToHTML(Page, getInitialContext(ctx), initialData);
      } catch (e) {
        html = htmlTemplate;
        console.error(e);
      }
      ctx.set('Content-Type', 'text/html; charset=utf-8');
      ctx.body = html;
    }

    async function render(ctx, options = {}) {
      let html;
      if (ctx.req) {
        const { initialData, htmlTemplate } = options;
        try {
          html = await renderToHTML(ctx.req, ctx.res, { initialData, htmlTemplate });
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

  if (formattedQuery.documentPath) {
    code = `import Document from '${formatPath(formattedQuery.documentPath)}';
    ${code}`;
  }

  return addExport(code);
}
