const qs = require('qs');
const fs = require('fs');
const path = require('path');

const isWin = process.platform === 'win32';

/**
 * Transform Windows-style paths, such as 'C:\Windows\system32' to 'C:/Windows/system32'.
 * Because 'C:\Windows\system32' will be escaped to 'C:Windowssystem32'
 * @param {*} p
 */
const formatPath = (p) => {
  return isWin ? p.split(path.sep).join('/') : p;
};

module.exports = function() {
  const query = typeof this.query === 'string' ? qs.parse(this.query.substr(1)) : this.query;
  const {
    absoluteDocumentPath,
    absoluteShellPath,
    absolutePagePath,
    pagePath,
    styles = [],
    scripts = [],
    doctype,
  } = query;

  const formatedShellPath = absoluteShellPath ? formatPath(absoluteShellPath) : null;
  const formatedPagePath = absolutePagePath ? formatPath(absoluteShellPath) : null;

  const shellStr = formatedShellPath && fs.existsSync(formatedShellPath) ? `import Shell from '${formatedShellPath}';` : 'const Shell = null;';
  const pageStr = formatedPagePath && fs.existsSync(formatedPagePath) ? `import Page from '${formatedPagePath}';` : 'const Page = null;';
  const doctypeStr = doctype === null || doctype === '' ? '' : `${doctype || '<!DOCTYPE html>'}`;

  const renderHtmlFnc = `
    async function renderComponentToHTML(Component, ctx) {

      const shellData = Shell ? await getInitialProps(Shell, ctx) : null;
      const pageData = Page ? await getInitialProps(Component, ctx) : null;
      const documentData = Document ? await getInitialProps(Document, ctx) : null;

      const initialData = {
        shellData : {},
        pageData: {},
        pagePath: '${pagePath}'
      };

      let contentElement;

      if (Shell) {
        if (Component) {
          contentElement = createElement(Shell, shellData, createElement(Component, pageData));
        } else {
          contentElement = createElement(Shell, shellData);
        }
      } else if (Component) {
        contentElement = createElement(Component, pageData)
      }

      const initialHtml = contentElement ? renderer.renderToString(contentElement, {
        defaultUnit: 'rpx'
      }) : null;

      // This loader is executed after babel, so need to be tansformed to ES5.
      const DocumentContextProvider = function() {};
      DocumentContextProvider.prototype.getChildContext = function() {
        return {
          __initialHtml: initialHtml,
          __initialData: JSON.stringify(initialData),
          __pagePath: '${pagePath}',
          __styles: ${JSON.stringify(styles)},
          __scripts: ${JSON.stringify(scripts)}
        };
      };

      DocumentContextProvider.prototype.render = function() {
        return createElement(Document, documentData);
      };

      const DocumentContextProviderElement = createElement(DocumentContextProvider);

      const html = '${doctypeStr}' + renderer.renderToString(DocumentContextProviderElement, {
        defaultUnit: 'rpx'
      });

      return html;
    }
  `;

  const source = `
    import { createElement } from 'rax';
    import renderer from 'rax-server-renderer';
    import Document from '${formatPath(absoluteDocumentPath)}';
    ${shellStr}
    ${pageStr}

    ${renderHtmlFnc}

    async function render(req, res) {
      const html = await renderToHTML(req, res);

      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.send(html);
    }

    async function renderToHTML(req, res) {
      const html = await renderComponentToHTML(Page, {
        req: req,
        res: res
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

  return source;
};
