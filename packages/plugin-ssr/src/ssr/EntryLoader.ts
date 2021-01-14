import { formatPath } from '@builder/app-helpers';
import * as qs from 'qs';

function addExport(fn) {
  return function (code: string) {
    return `${fn(code)}
    export {
      render,
      renderToHTML,
      renderWithContext,
    };
    `;
  };
}

function addBuiltInRenderMethod(code) {
  return `${code}
  async function render(req, res, htmlTemplate = '__RAX_APP_SERVER_HTML_TEMPLATE__') {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    const $ = cheerio.load(htmlTemplate, { decodeEntities: false });
    const root = $('#root');

    const { html, pageData } = await renderComponentToHTML(Page, {
      req,
      res
    });
    const data = {
      __SSR_ENABLED__: true,
      pageData
    };
    root.html(html);
    root.before('<script data-from="server">window.__INITIAL_DATA__=' + JSON.stringify(data) + '</script>');
    res.send($.html());
  };
  `;
}

function addImportDocument(code, documentPath) {
  return `
    import Document from '${formatPath(documentPath)}';
    ${code}
    `;
}

function addCustomRenderMethod(code) {
  return `${code}
  async function render(req, res) {
    const { res, req } = ctx;
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    const $ = cheerio.load(htmlTemplate);
    const root = $('#root');

    const { html, pageData } = await renderComponentToHTML(Page, {
      req,
      res
    });
    const data = {
      __SSR_ENABLED__: true,
      pageData
    };
    root.html(html);
    root.before('<script data-from="server">window.__INITIAL_DATA__=' + JSON.stringify(data) + '</script>');
    res.send($.html());
  };
  `;
}

export default function () {
  const { documentPath } = qs.parse(this.query.substr(1)) || {};

  let code = `
    import * as cheerio from 'cheerio';
    import { createElement } from 'rax';
    import renderer from 'rax-server-renderer';
    import Page from '${formatPath(this.resourcePath)}';

    async function getInitialProps(Component, ctx) {
      if (!Component.getInitialProps) return null;
      const props = await Component.getInitialProps(ctx);
      if (!props || typeof props !== 'object') {
        const message = '"getInitialProps()" should resolve to an object. But found "' + props + '" instead.';
        throw new Error(message);
      }
      return props;
    }

    async function renderComponentToHTML(Component, ctx) {
      const pageData = await getInitialProps(Component, ctx);
      const contentElement = createElement(Component, pageData);
      const html = renderer.renderToString(contentElement, {
        defaultUnit: 'rpx'
      });

      return {
        html,
        pageData,
      }
    }

    async function renderToHTML(req, res) {
      const { html } = await renderComponentToHTML(Page, {
        req,
        res
      });
      return html;
    }

    async function renderWithContext(ctx) {
      const { html } = await renderComponentToHTML(Page, ctx);
      ctx.set('Content-Type', 'text/html; charset=utf-8');
      ctx.body = html;
    }
  `;

  if (documentPath) {
    code = addImportDocument(code, documentPath);
  }

  return addExport(addBuiltInRenderMethod)(code);
}
