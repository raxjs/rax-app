import { ILoaderQuery } from '../types';
import addPageHTMLAssign from './addPageHTMLAssign';

export default function addBuiltInRenderComponentToHTML({ useRunApp }: ILoaderQuery) {
  return `
  async function renderComponentToHTML(Component, ctx, initialData, htmlTemplate = "__RAX_APP_SERVER_HTML_TEMPLATE__") {
    const $ = cheerio.load(htmlTemplate, { decodeEntities: false });
    const root = $('#root');

    const pageInitialProps = await getInitialProps(Component, ctx);
    const data = {
      __SSR_ENABLED__: true,
      initialData,
      pageInitialProps
    };
    // Assign pageHTML
    ${addPageHTMLAssign(useRunApp)}
    root.html(pageHTML);
    root.before('<script data-from="server">window.__INITIAL_DATA__=' + JSON.stringify(data) + '</script>');
    return $.html();
  };
  `;
}
