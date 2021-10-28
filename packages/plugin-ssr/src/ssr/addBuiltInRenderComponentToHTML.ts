import { ILoaderQuery } from '../types';
import addPageHTMLAssign from './addPageHTMLAssign';

export default function addBuiltInRenderComponentToHTML({ useRunApp, updateDataInClient }: ILoaderQuery) {
  return `
  async function renderComponentToHTML(Component, ctx, options ) {
    const { initialData, htmlTemplate = "__RAX_APP_SERVER_HTML_TEMPLATE__", initialProps } = options;
    const $ = new Generator(htmlTemplate);

    const pageInitialProps = initialProps || await getInitialProps(Component, ctx);
    const data = {
      __SSR_ENABLED__: true,
      initialData,
      pageInitialProps
    };
    // Assign pageHTML
    ${addPageHTMLAssign(useRunApp)}
    $.root.innerHTML = pageHTML;
    ${updateDataInClient ? '' : '$.insertScript(\'<script data-from="server">window.__INITIAL_DATA__=\' + stripXSS(JSON.stringify(data)) + \'</script>\');'}
    return $.html();
  };
  `;
}
