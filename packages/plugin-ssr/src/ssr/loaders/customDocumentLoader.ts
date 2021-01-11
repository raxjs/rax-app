import * as qs from 'qs';
import { formatPath } from '@builder/app-helpers';
import EntryLoader from './EntryLoader';

class CustomDocumentLoader extends EntryLoader {
  documentPath: string;
  styles: string[];
  scripts: string[];
  assetsProcessor: string;
  pagePath: string;
  constructor(options) {
    super(options);
    this.documentPath = options.documentPath;
    this.styles = options.styles || [];
    this.scripts = options.scripts;
    this.assetsProcessor = options.assetsProcessor;
    this.pagePath = options.pagePath;
  }
  addInitImport() {
    super.addInitImport();
    this.source += `
    import Document from '${this.documentPath}';
    `;
    return this;
  }
  addRenderComponentToHTML() {
    this.source += `
    async function renderComponentToHTML(Component, ctx) {
      const pageData = await getInitialProps(Component, ctx);
      const initialData = appConfig.app && appConfig.app.getInitialData ? await appConfig.app.getInitialData() : {};

      const data = {
        __SSR_ENABLED__: true,
        initialData,
        pageData,
      };

      const contentElement = createElement(Component, pageData);

      const initialHtml = renderer.renderToString(contentElement, {
        defaultUnit: 'rpx'
      });
      // use let statement, because styles and scripts may be changed by assetsProcessor
      let styles = ${JSON.stringify(this.styles)};
      let scripts = ${JSON.stringify(this.scripts)};

      // process public path for different runtime env
      ${this.assetsProcessor || ''}

      // This loader is executed after babel, so need to be tansformed to ES5.
      const DocumentContextProvider = function() {};
      DocumentContextProvider.prototype.getChildContext = function() {
        return {
          __initialHtml: initialHtml,
          __initialData: JSON.stringify(data),
          __styles: styles,
          __scripts: scripts,
          __pagePath: '${this.pagePath}'
        };
      };
      DocumentContextProvider.prototype.render = function() {
        return createElement(Document, initialData);
      };

      const DocumentContextProviderElement = createElement(DocumentContextProvider);

      const html = '<!doctype html>' + renderer.renderToString(DocumentContextProviderElement);

      return html;
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

  const customDocumentLoader = new CustomDocumentLoader(query);

  return customDocumentLoader
    .addInitImport()
    .addVariableDeclaration()
    .addGetInitialProps()
    .addRenderComponentToHTML()
    .addRenderToHTML()
    .addRender()
    .addRenderWithContext()
    .addExport()
    .getSource();
}
