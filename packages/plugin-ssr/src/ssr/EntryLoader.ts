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
    root.before('<l data-from="server">window.__INITIAL_DATA__=' + JSON.stringify(data) + '</l>');
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

function addCustomRenderMethod({ needInjectStyle, entryName, publicPath }, code) {
  const scripts = [];
  const styles = [];
  if (needInjectStyle) {
    styles.push(`<link rel="stylesheet" href="${publicPath}${entryName}.css"></link>`);
  }
  scripts.push(`<script src="${publicPath}${entryName}.js"></script>`);

  return `${code}
  async function render(req, res) {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');

    const { html: pageHTML, pageData } = await renderComponentToHTML(Page, {
      req,
      res
    });

    const data = {
      __SSR_ENABLED__: true,
      pageData
    };

    let scripts = ${JSON.stringify(scripts)};
    let styles = ${JSON.stringify(styles)};

    const DocumentContextProvider = function() {};
    DocumentContextProvider.prototype.getChildContext = function() {
      return {
        __initialData: JSON.stringify(data),
        __styles: styles,
        __scripts: scripts,
      };
    };
    DocumentContextProvider.prototype.render = function() {
      return createElement(Document);
    };

    const html = renderer.renderToString(createElement(DocumentContextProvider));

    const $ = cheerio.load(html);
    const root = $('#root');

    root.html(html);
    if (html.indexOf('window.__INITIAL_DATA__=') < 0) {
      root.after('<script data-from="server">window.__INITIAL_DATA__=' + JSON.stringify(data) + '</script>');
    }
    root.html(pageHTML);
    res.send($.html());
  };
  `;
}

export default function () {
  const query = qs.parse(this.query.substr(1)) || {};

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

  if (query.documentPath) {
    code = addImportDocument(code, query.documentPath);
    return addExport(addCustomRenderMethod.bind(null, query))(code);
  }

  return addExport(addBuiltInRenderMethod)(code);
}
