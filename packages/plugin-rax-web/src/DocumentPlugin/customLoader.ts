import * as qs from 'qs';
import * as fs from 'fs';
import { ICustomDocumentQuery } from '../types';

/**
 * loader for wrap document and pages to be server render function, which can render page to html
 */
export default function () {
  const query: ICustomDocumentQuery = typeof this.query === 'string' ? qs.parse(this.query.substr(1)) : this.query;
  const { documentPath, staticExportPagePath, pagePath, htmlInfo = {} } = query;
  const { doctype, title } = htmlInfo;

  const pageStr =
    staticExportPagePath && fs.existsSync(staticExportPagePath)
      ? `import Page from '${staticExportPagePath}';`
      : 'const Page = null;';
  const doctypeStr = doctype === null || doctype === '' ? '' : `${doctype || '<!DOCTYPE html>'}`;

  const source = `
    import { createElement } from 'rax';
    import renderer from 'rax-server-renderer';
    import Document from '${documentPath}';
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
          __scripts: assets.scripts
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
}
