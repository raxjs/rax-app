const qs = require('qs');
const fs = require('fs');
const path = require('path');
const babel = require('@babel/core');
const { getBabelConfig } = require('rax-compile-config');

const babelConfig = getBabelConfig();

const isWin = process.platform === 'win32';

/**
 * Transform Windows-style paths, such as 'C:\Windows\system32' to 'C:/Windows/system32'.
 * Because 'C:\Windows\system32' will be escaped to 'C:Windowssystem32'
 * @param {*} p 
 */
const normalizePath = (p) => {
  return isWin ? p.split(path.sep).join('/') : p;
};

module.exports = function() {
  const query = typeof this.query === 'string' ? qs.parse(this.query.substr(1)) : this.query;

  const {
    absoluteDocumentPath,
    absoluteShellPath,
    absolutePagePath,
    absoluteAppJSONPath,
    pageName,
    pagePath,
    styles = [],
    scripts = [],
  } = query;

  const hasShell = fs.existsSync(absoluteShellPath);
  const shellStr = hasShell ? `import Shell from '${normalizePath(absoluteShellPath)}'` : 'const Shell = function (props) { return props.children };';

  const renderHtmlFnc = `
    async function renderComponentToHTML(Component, ctx) {

      const shellData = await getInitialProps(Shell, ctx);
      const pageData = await getInitialProps(Component, ctx);
      const documentData = await getInitialProps(Document, ctx);

      const initialData = {
        shellData,
        pageData,
        pagePath: '${pagePath}'
      };

      const contentElement = createElement(Shell, shellData, createElement(Component, pageData));

      const initialHtml = renderer.renderToString(contentElement, {
        defaultUnit: 'rpx'
      });

      // This loader is executed after babel, so need to be tansformed to ES5.
      const DocumentContextProvider = function() {};
      DocumentContextProvider.prototype.getChildContext = function() {
        return {
          __initialHtml: initialHtml,
          __initialData: JSON.stringify(initialData),
          __pageName: '${pageName}',
          __styles: ${JSON.stringify(styles)},
          __scripts: ${JSON.stringify(scripts)},
        };
      };
      DocumentContextProvider.prototype.render = function() {
        return createElement(Document, documentData);
      };

      const DocumentContextProviderElement = createElement(DocumentContextProvider);

      const html = '<!doctype html>' + renderer.renderToString(DocumentContextProviderElement);

      return html;
    }
  `;

  const source = `
    import { createElement } from 'rax';
    import renderer from 'rax-server-renderer';

    import Page from '${normalizePath(absolutePagePath)}';
    import Document from '${normalizePath(absoluteDocumentPath)}';
    import appJSON from '${normalizePath(absoluteAppJSONPath)}';
    ${shellStr}

    ${renderHtmlFnc}

    async function render(req, res) {
      const html = await renderToHTML(req, res);

      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.send(html);
    }

    async function renderToHTML(req, res) {
      const html = await renderComponentToHTML(Page, {
        req,
        res
      });
      return html;
    }

    // Handler for Midway FaaS and Koa
    async function renderWithContext(ctx) {
      const html = await renderComponentToHTML(Page, ctx);

      ctx.set('Content-Type', 'text/html; charset=utf-8');
      ctx.body = html;
    }

    export {
      render,
      renderToHTML,
      renderWithContext
    };

    export default render;

    async function getInitialProps(Component, ctx) {
      if (!Component.getInitialProps) return null;

      const props = await Component.getInitialProps(ctx);

      if (!props || typeof props !== 'object') {
        const message = '"getInitialProps()" should resolve to an object. But found "' + props + '" instead.';
        throw new Error(message);
      }

      return props;
    }
  `;

  const { code } = babel.transformSync(source, babelConfig);

  return code;
};
