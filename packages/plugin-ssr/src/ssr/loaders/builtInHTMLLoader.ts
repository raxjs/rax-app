import * as qs from 'qs';
import { formatPath } from '@builder/app-helpers';
import EntryLoader from './EntryLoader';
import { IInjectedHTML } from '../../types';

class BuiltInHTMLLoader extends EntryLoader {
  injectedHTML: IInjectedHTML;
  styles: string[];
  scripts: string[];
  assetsProcessor: string;
  builtInHTML: string;
  constructor(options) {
    super(options);
    this.injectedHTML = options.injectedHTML;
    this.styles = options.styles || [];
    this.scripts = options.scripts;
    this.assetsProcessor = options.assetsProcessor;
    this.builtInHTML = options.builtInHTML;
  }
  addInitImport() {
    super.addInitImport();
    this.source += `
      import * as cheerio from 'cheerio';
    `;
    return this;
  }
  addVariableDeclaration() {
    super.addVariableDeclaration();
    this.source += `
    let builtInMetas = ${JSON.stringify(this.injectedHTML.metas)} || [];
    let builtInLinks = ${JSON.stringify(this.injectedHTML.links)} || [];
    let builtInScripts = ${JSON.stringify(this.injectedHTML.scripts)} || [];
    `;
    return this;
  }
  addGenerateHtml() {
    this.source += `
    function generateHtml(htmlStr, initialHtml) {
      const $ = cheerio.load(htmlStr);
      const root = $('#root');
      const title = $('title');
      title.before(builtInMetas);
      title.after(builtInLinks);
      root.after(builtInScripts);
      root.html(initialHtml)
      return $.html();
    }
    `;
    return this;
  }
  addRenderComponentToHTML() {
    this.source += `
    async function renderComponentToHTML(Component, ctx) {
      const pageData = await getInitialProps(Component, ctx);
      const initialData = appConfig.app && appConfig.app.getInitialData ? await appConfig.app.getInitialData(ctx) : {};

      const data = {
        __SSR_ENABLED__: true,
        initialData,
        pageData,
      };

      builtInScripts.push('<script data-from="server">window.__INITIAL_DATA__=' + JSON.stringify(data) + '</script>')

      const contentElement = createElement(Component, pageData);

      const initialHtml = renderer.renderToString(contentElement, {
        defaultUnit: 'rpx'
      });
      // use let statement, because styles and scripts may be changed by assetsProcessor
      let styles = ${JSON.stringify(this.styles)};
      let scripts = ${JSON.stringify(this.scripts)};

      // process public path for different runtime env
      ${this.assetsProcessor || ''}

      builtInLinks = [...builtInLinks, ...styles];
      builtInScripts = [...builtInScripts, ...scripts];

      return generateHtml(\`${this.builtInHTML}\`, initialHtml);
    }
  `;
    return this;
  }
}

export default function () {
  const query = typeof this.query === 'string' ? qs.parse(this.query.substr(1)) : this.query;

  if (!query.entryPath) {
    query.entryPath = formatPath(this.resourcePath);
  }

  const builtInHTMLLoader = new BuiltInHTMLLoader(query);

  return builtInHTMLLoader
    .addInitImport()
    .addVariableDeclaration()
    .addGenerateHtml()
    .addGetInitialProps()
    .addRenderComponentToHTML()
    .addRenderToHTML()
    .addRender()
    .addRenderWithContext()
    .addExport()
    .getSource();
}
