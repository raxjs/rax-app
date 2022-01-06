import { IFormattedLoaderQuery } from '../types';
import addPageHTMLAssign from './addPageHTMLAssign';

export default function addBuiltInRenderComponentToHTML({ updateDataInClient }: IFormattedLoaderQuery) {
  return `
  async function renderComponentToHTML(Component, ctx, options ) {
    const { initialData, htmlTemplate, initialProps } = options;
    const $ = new Generator(htmlTemplate || '__RAX_APP_SERVER_HTML_TEMPLATE__');

    const pageInitialProps = initialProps || await getInitialProps(Component, ctx);
    const data = {
      __SSR_ENABLED__: true,
      initialData,
      pageInitialProps
    };

    let initialHtml;

    if (options.__pageHTML != null) {
      initialHtml = options.__pageHTML;
    } else {
      // Assign pageHTML
      ${addPageHTMLAssign()}
      initialHtml = pageHTML;
    }

    $.root.innerHTML = initialHtml;
    ${updateDataInClient ? '' : '$.insertScript(\'<script data-from="server">window.__INITIAL_DATA__=\' + stripXSS(JSON.stringify(data)) + \'</script>\');'}
    return $.html();
  };
  `;
}
