const qs = require('qs');
const fs = require('fs');
const babel = require('@babel/core');
const { getBabelConfig } = require('rax-compile-config');

const babelConfig = getBabelConfig();

module.exports = function() {
  const query = typeof this.query === 'string' ? qs.parse(this.query.substr(1)) : this.query;

  const {
    absoluteDocumentPath,
    absoluteShellPath,
    absolutePagePath,
    absoluteAppJSONPath,
    publicPath,
    pageName,
    pagePath,
    styles = [],
    scripts = [],
  } = query;

  const hasShell = fs.existsSync(absoluteShellPath);
  const shellStr = hasShell ? `import Shell from '${absoluteShellPath}'` : 'const Shell = function (props) { return props.children };';

  const renderHtmlFnc = `
    async function renderComponentToHTML(req, res, Component) {
      const ctx = {
        req,
        res
      };

      const shellData = await getInitialProps(Shell, ctx);
      const pageData = await getInitialProps(Component, ctx);

      const initialData = {
        shellData,
        pageData,
        pagePath: '${pagePath}'
      };

      const contentElement = createElement(Shell, shellData, createElement(Component, pageData));

      const initialHtml = renderer.renderToString(contentElement, {
        defaultUnit: 'rpx'
      });

      const documentProps = {
        initialHtml: initialHtml,
        initialData: JSON.stringify(initialData),
        publicPath: '${publicPath}',
        pageName: '${pageName}',
        styles: ${JSON.stringify(styles)},
        scripts: ${JSON.stringify(scripts)}
      };

      await getInitialProps(Document, ctx);
      const documentElement = createElement(Document, documentProps);;
      const html = '<!doctype html>' + renderer.renderToString(documentElement);

      return html;
    }
  `;

  const source = `
    import { createElement } from 'rax';
    import renderer from 'rax-server-renderer';

    import Page from '${absolutePagePath}';
    import Document from '${absoluteDocumentPath}';
    import appJSON from '${absoluteAppJSONPath}';
    ${shellStr}

    ${renderHtmlFnc}

    export async function render(req, res) {
      const html = await renderToHTML(req, res);

      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.send(html);
    }

    export async function renderToHTML(req, res) {
      const html = await renderComponentToHTML(req, res, Page);
      return html;
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
  `;

  const { code } = babel.transformSync(source, babelConfig);

  return code;
};
