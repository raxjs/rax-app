import { IFormattedLoaderQuery } from '../types';
import addPageHTMLAssign from './addPageHTMLAssign';
import genComboedScript from '../utils/genComboedScript';

export default function addCustomRenderComponentToHTML(
  {
    entryName,
    publicPath,
    pageConfig = { path: '/' },
    assetsProcessor = '',
    doctype = '<!DOCTYPE html>',
    injectedHTML = { scripts: [] },
    updateDataInClient,
  }: IFormattedLoaderQuery,
) {
  const injectedScripts = (injectedHTML.scripts || []);

  if (injectedHTML.comboScripts) {
    injectedScripts.unshift(genComboedScript(injectedHTML.comboScripts));
  }
  return `
  async function renderComponentToHTML(Component, ctx, options = {}) {
    const { initialData, htmlTemplate, initialProps } = options;
    const pageInitialProps = initialProps || await getInitialProps(Component, ctx);

    const data = {
      __SSR_ENABLED__: true,
      initialData,
      pageInitialProps,
    };

    // Assign pageHTML
    ${addPageHTMLAssign()}

    const documentData = await getInitialProps(Document, ctx);

    function getTitle(config) {
      return config.window && config.window.title
    }
    const title = ${JSON.stringify(pageConfig.window?.title || '')} || getTitle(staticConfig);

    const chunkInfo = JSON.parse(decodeURIComponent("__CHUNK_INFO__"));

    let scripts = chunkInfo[${JSON.stringify(entryName)}].js
      .map(filename => ${JSON.stringify(publicPath)} + filename);
    let styles = chunkInfo[${JSON.stringify(entryName)}].css
      .map(filename => ${JSON.stringify(publicPath)} + filename);

    ${assetsProcessor}

    const DocumentContextProvider = function() {};
    DocumentContextProvider.prototype.getChildContext = function() {
      return {
        __initialHtml: pageHTML,
        __initialData: stripXSS(JSON.stringify(data)),
        __styles: styles,
        __scripts: scripts,
        __pagePath: '${pageConfig.path}'
      };
    };
    DocumentContextProvider.prototype.render = function() {
      return createElement(Document, {
        ...documentData,
        title,
      });
    };

    const html = renderer.renderToString(createElement(DocumentContextProvider));

    const $ = new Generator(html);
    if (title) {
      $.title.innerHTML = title;
    }

    $.insertScript(${JSON.stringify(injectedScripts)});

    ${updateDataInClient ? '' : `if (html.indexOf('window.__INITIAL_DATA__=') < 0) {
      $.insertScript('<script data-from="server">window.__INITIAL_DATA__=' + JSON.stringify(data) + '</script>')
    }`}

    return '${doctype || ''}' + $.html();
  };
  `;
}
