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
  };`;
}

function addImportDocument(code, documentPath) {
  return `
    import Document from '${formatPath(documentPath)}';
    ${code}
    `;
}

function addImportPageComponent(resourcePath, pageConfig) {
  return `import Page from '${formatPath(resourcePath)}';
  Page.__pageConfig = ${JSON.stringify(pageConfig)};`;
}

function addRunAppDependcies(resourcePath, tempPath) {
  return `
  import '${resourcePath}';
  import app from '${path.join(tempPath, 'runApp.ts')}';

  const { createBaseApp, emitLifeCycles } = app;
  `;
}

function addDefineInitialPage() {
  return `
  const pathname = req.path;
  const routes = staticConfig.routes;
  const route = routes.find(({ path }) => path === pathname);
  const Page = route.component();
  Page.__pageConfig = {
    title: route.window && route.window.title,
  };
  `;
}

/**
 * Global variables:
 * utils: cheerio/qs/chalk
 * rax render: createElement/renderer
 * Component: Page/Document
 * generated in .rax: appConfig/staticConfig/createBaseApp/emitLifeCycles
 */
export default function () {
  const query = (qs.parse(this.query.substr(1)) as unknown) as ILoaderQuery;
  const appConfigPath = path.join(query.tempPath, 'appConfig.ts');
  query.useRunApp = query.useRunApp === 'true';
  query.needInjectStyle = query.needInjectStyle === 'true';
  let code = `
    import * as cheerio from 'cheerio';
    import { createElement } from 'rax';
    import renderer from 'rax-server-renderer';
    import staticConfig from '${formatPath(path.join(query.tempPath, 'staticConfig.ts'))}';
    import { getAppConfig } from '${formatPath(appConfigPath)}';
    import * as qs from 'qs';
    import * as chalk from 'chalk';
    ${
  query.useRunApp
    ? addRunAppDependcies(this.resourcePath, query.tempPath)
    : addImportPageComponent(this.resourcePath, query.pageConfig)
}

    const appConfig = getAppConfig() || {};

    function logError(msg) {
      console.log(
        chalk.red('ERR!'),
        chalk.magenta(msg),
      );
    }

    async function getInitialProps(Component, ctx) {
      if (!Component.getInitialProps) return null;
      const props = await Component.getInitialProps(ctx);
      if (!props || typeof props !== 'object') {
        const message = '"getInitialProps()" should resolve to an object. But found "' + props + '" instead.';
        throw new Error(message);
      }
      return props;
    }

    ${query.documentPath ? addCustomRenderComponentToHTML(query) : addBuiltInRenderComponentToHTML(query)}

    async function renderToHTML({ ctx, initialData, htmlTemplate }) {
      const { req, res } = ctx;
      ${query.useRunApp ? addDefineInitialPage() : ''}
      const html = await renderComponentToHTML(Page, ctx, initialData, htmlTemplate);
      return html;
    }

    async function renderWithContext(ctx, options = {}) {
      const { res, req } = ctx;
      const { initialData, htmlTemplate } = options;
      ${query.useRunApp ? addDefineInitialPage() : ''}
      let html;
      try {
        html = await renderComponentToHTML(Page, ctx, initialData);
      } catch (e) {
        html = htmlTemplate;
        logError(e);
      }
      ctx.set('Content-Type', 'text/html; charset=utf-8');
      ctx.body = html;
    }

    async function render(ctx, options) {
      let html;
      if (ctx.req) {
        try {
          const { initialData, htmlTemplate } = options;
          html = await renderToHTML({ ctx, initialData, htmlTemplate });
        } catch (e) {
          html = htmlTemplate;
          logError(e);
        }
      } else {
        const [req, res] = [...arguments];
        ctx = { req, res };
        html = await renderToHTML({ ctx });
      }

      ctx.res.setHeader('Content-Type', 'text/html; charset=utf-8');
      ctx.res.send(html);
    }
  `;

  if (query.documentPath) {
    code = addImportDocument(code, query.documentPath);
  }

  return addExport(code);
}
