import * as qs from 'qs';

function addPageDefine(entryPath: string): string {
  return `import Page from '${entryPath}';`;
}

function addRenderInitialHTML() {
  return `initialHTML = renderer.renderToString(createElement(Page), {
    defaultUnit: 'rpx'
  });`;
}

export default function () {
  const { documentPath, staticExport, entryPath } = qs.parse(this.query.substr(1));
  if (documentPath) {
    return `
      import { createElement } from 'rax';
      import Document from '${documentPath}';
      ${staticExport ? addPageDefine(entryPath as string) : ''}
      import renderer from 'rax-server-renderer';

      function renderPage(assets, { title, doctype, pagePath }) {
        let initialHTML = '';
        ${staticExport ? addRenderInitialHTML() : ''}

        // This loader is executed after babel, so need to be transformed to ES5.
        const DocumentContextProvider = function() {};
        DocumentContextProvider.prototype.getChildContext = function() {
          return {
            __initialHtml: initialHTML,
            __styles: assets.links,
            __scripts: assets.scripts,
            __pagePath: pagePath,
          };
        };
        DocumentContextProvider.prototype.render = function() {
          return createElement(Document, {
            title,
          });
        };

        return doctype + renderer.renderToString(createElement(DocumentContextProvider), {
          defaultUnit: 'rpx'
        });
      }

      export {
        renderPage
      };
  `;
  }
  return `
    import { createElement } from 'rax';
    import Page from '${entryPath}';
    import renderer from 'rax-server-renderer';

    function renderPage() {
      return renderer.renderToString(createElement(Page), {
        defaultUnit: 'rpx'
      });
    }

    export {
      renderPage
    };
  `;
}
