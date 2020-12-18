import * as qs from 'qs';
import * as fs from 'fs';
import { formatPath } from '@builder/app-helpers';
import { IBuiltInDocumentQuery } from '../types';

/**
 * loader for wrap document and pages to be server render function, which can render page to html
 */
export default function () {
  const query: IBuiltInDocumentQuery = typeof this.query === 'string' ? qs.parse(this.query.substr(1)) : this.query;
  const { staticExportPagePath, builtInDocumentTpl } = query;

  const formatedPagePath = staticExportPagePath ? formatPath(staticExportPagePath) : null;
  const needStaicExport = formatedPagePath && fs.existsSync(formatedPagePath);


  if (needStaicExport) {
    return `
  import { createElement } from 'rax';
  import renderer from 'rax-server-renderer';
  import Page from '${formatedPagePath}';

  function renderInitialHTML(assets) {
    const contentElement = createElement(Page, {});

    const initialHtml = contentElement ? renderer.renderToString(contentElement, {
      defaultUnit: 'rpx'
    }) : '';

    return initialHtml;
  }

  export {
    renderInitialHTML,
    getHTML() {
      return ${builtInDocumentTpl};
    }
  };
`;
  } else {
    return `
      export {
        renderInitialHTML() {
          return '';
        },
        getHTML() {
          return ${builtInDocumentTpl};
        }
      }
    `;
  }
}
