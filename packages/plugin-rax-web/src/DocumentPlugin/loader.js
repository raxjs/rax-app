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

/**
 * loader for wrap document and pages to be server render function, which can render page to html
 */
module.exports = function () {
  const query = typeof this.query === 'string' ? qs.parse(this.query.substr(1)) : this.query;
  const {
    absoluteDocumentPath,
    absolutePagePath,
    pagePath,
    htmlInfo,
    manifests,
  } = query;
  const { doctype, title } = htmlInfo;

  const formatedPagePath = absolutePagePath ? formatPath(absolutePagePath) : null;

  const pageStr = formatedPagePath && fs.existsSync(formatedPagePath) ? `import Page from '${formatedPagePath}';` : 'const Page = null;';
  const doctypeStr = doctype === null || doctype === '' ? '' : `${doctype || '<!DOCTYPE html>'}`;

  const source = `
    import { createElement } from 'rax';
    import renderer from 'rax-server-renderer';
    import Document from '${formatPath(absoluteDocumentPath)}';
    ${pageStr}

    function renderToHTML(assets) {
      let contentElement;
      if (Page) {
        contentElement = createElement(Page, {})
      }

      const initialHtml = contentElement ? renderer.renderToString(contentElement, {
        defaultUnit: 'rpx'
      }) : null;

      // This loader is executed after babel, so need to be tansformed to ES5.
      const DocumentContextProvider = function() {};
      DocumentContextProvider.prototype.getChildContext = function() {
        return {
          __initialHtml: initialHtml,
          __pagePath: '${pagePath}',
          __styles: assets.styles,
          __scripts: assets.scripts,
          __manifests: ${manifests}
        };
      };

      DocumentContextProvider.prototype.render = function() {
        return createElement(Document, {
          title: '${title}'
        });
      };

      const DocumentContextProviderElement = createElement(DocumentContextProvider);

      // For universal app, driver-universal will convert unitless style to rpx
      const html = '${doctypeStr}' + renderer.renderToString(DocumentContextProviderElement, {
        defaultUnit: 'rpx'
      });

      return html;
    }

    export {
      renderToHTML,
    };
  `;

  return source;
};
