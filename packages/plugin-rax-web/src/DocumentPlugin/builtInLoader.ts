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
  let source;

  if (needStaicExport) {
    source = `
  import { createElement } from 'rax';
  import renderer from 'rax-server-renderer';
  import Page from '${formatedPagePath}';

  export function renderInitialHTML(assets) {
    const contentElement = createElement(Page, {});

    const initialHtml = contentElement ? renderer.renderToString(contentElement, {
      defaultUnit: 'rpx'
    }) : '';

    return initialHtml;
  }
`;
  } else {
    source = `
    export const renderInitialHTML = () => '';
    `;
  }
  source += `\n export const html = \`${builtInDocumentTpl}\`;`;
  return source;
}
