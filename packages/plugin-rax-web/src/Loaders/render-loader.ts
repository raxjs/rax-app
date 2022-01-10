import * as qs from 'qs';
import * as path from 'path';
import { formatPath } from '@builder/app-helpers';

function getInitialHTML(staticExport): string {
  if (!staticExport) return '\'\'';
  return `raxServerRenderer({ pageConfig, createElement }, {
    appConfig,
    createBaseApp,
    emitLifeCycles,
    TabBar,
    staticConfig,
  })`;
}

function addSSGDefine(staticExport, { entryPath, runAppPath, tempPath }) {
  if (!staticExport) return '';
  const corePath = path.join(tempPath as string, 'core');
  return `import '${formatPath(entryPath as string)}';
  import app from '${formatPath(runAppPath as string)}';
  import { getAppConfig } from '${formatPath(path.join(corePath, 'appConfig'))}';
  import { emitLifeCycles } from '${formatPath(path.join(corePath, 'publicAPI'))}';

  const appConfig = getAppConfig();
  const raxServerRenderer = require('rax-app-renderer/lib/server').default;
  const { createBaseApp, staticConfig, pageConfig, TabBar } = app;`;
}

export default function () {
  const query = qs.parse(this.query.substr(1));
  const { documentPath, staticExport, runAppPath, entryPath, tempPath } = query;
  if (documentPath) {
    return `
      import { createElement } from 'rax';
      import Document from '${formatPath(documentPath as string)}';
      import renderer from 'rax-server-renderer';
      ${addSSGDefine(staticExport, { entryPath, runAppPath, tempPath })}

      function renderPage(assets, { title, doctype, pagePath }) {
        const initialHTML = ${getInitialHTML(staticExport)};

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

        const html = renderer.renderToString(createElement(DocumentContextProvider), {
          defaultUnit: 'rpx'
        });

        if (doctype) {
          return doctype + html;
        }

        return html;
      }

      export {
        renderPage
      };
  `;
  }
  return `
    import { createElement } from 'rax';
    ${addSSGDefine(staticExport, { entryPath, runAppPath, tempPath })}

    function renderPage() {
      return ${getInitialHTML(staticExport)};
    }

    export {
      renderPage
    };
  `;
}
