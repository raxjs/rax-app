import * as qs from 'qs';
import * as path from 'path';
import * as fs from 'fs-extra';
import * as webpack from 'webpack';
import * as webpackSources from 'webpack-sources';
import * as errorStackTracey from 'error-stack-tracey';
import { formatPath } from '@builder/app-helpers';
import {
  getBuiltInHtmlTpl,
  generateHtmlStructure,
  insertCommonElements,
  insertLinks,
  insertScripts,
} from '../utils/htmlStructure';
import { IHtmlInfo, IBuiltInDocumentQuery, ICustomDocumentQuery } from '../types';

const { parse, print } = errorStackTracey;
const { RawSource } = webpackSources;
const PLUGIN_NAME = 'DocumentPlugin';

export default class DocumentPlugin {
  options: any;
  documentPath: string | undefined;
  constructor(options) {
    /**
     * An plugin which generate HTML files
     * @param {object} options
     * @param {object} options.context build plugin context
     * @param {object[]} options.pages pages need to generate HTML
     * @param {string} options.pages[].entryName
     * @param {string} options.pages[].path  page path for MPA to get pageInfo in route config
     * @param {string} options.pages[].source page source for static export
     * @param {boolean} [options.staticExport] static exporting
     * @param {string} [options.loader] custom document loader
     * @param {string} [options.publicPath] for internal weex publish
     * @param {function} [options.configWebpack] custom webpack config for document
     */
    this.options = options;
    const {
      context: { rootDir },
    } = options;
    this.documentPath = getAbsoluteFilePath(rootDir, 'src/document/index');
  }

  apply(compiler) {
    const { context, ...options } = this.options;
    const { rootDir } = context;
    const { webpackConfig } = options;

    const mainConfig = compiler.options;

    // Get output dir from filename instead of hard code.
    const outputFilePrefix = getPathInfoFromFileName(mainConfig.output.filename);
    const publicPath = options.publicPath ? options.publicPath : mainConfig.output.publicPath;

    const pages = {};

    // Get all entry point names for html file
    Object.keys(mainConfig.entry).forEach((entryName) => {
      pages[entryName] = {
        tempFile: `__${entryName.replace(/\//g, '_')}_document`,
        fileName: `${outputFilePrefix}${entryName}.html`,
      };
    });

    // Merge the page info from options
    if (options.pages) {
      options.pages.forEach((page) => {
        const pageInfo = pages[page.entryName];
        if (pageInfo) {
          Object.assign(pageInfo, {
            pagePath: page.path,
            source: page.source,
          });
        }
      });
    }

    // Support custom loader
    const loaderForDocument =
      options.loader || (this.documentPath ? require.resolve('./customLoader') : require.resolve('./builtInLoader'));

    delete webpackConfig.entry.index;
    // Add ssr loader for each entry
    Object.keys(pages).forEach((entryName) => {
      const pageInfo = pages[entryName];
      const { tempFile, source, pagePath } = pageInfo;

      if (!webpackConfig.entry[tempFile]) {
        webpackConfig.entry[tempFile] = [];
      }

      const staticExportPagePath: string =
        options.staticExport && source ? getAbsoluteFilePath(rootDir, path.join('src', source)) : '';

      const targetPage = source && options.staticConfig.routes.find((route) => route.source === source);
      const htmlInfo: IHtmlInfo = {
        ...options.htmlInfo,
        title: (targetPage && targetPage.window && targetPage.window.title) || options.htmlInfo.title,
      };

      if (this.documentPath) {
        const query: ICustomDocumentQuery = {
          documentPath: this.documentPath,
          staticExportPagePath,
          pagePath,
          htmlInfo,
        };

        webpackConfig.entry[tempFile].push(`${loaderForDocument}?${qs.stringify(query)}!${this.documentPath}`);
      } else {
        const builtInDocumentTpl = getBuiltInHtmlTpl(htmlInfo);
        const query: IBuiltInDocumentQuery = {
          staticExportPagePath,
          builtInDocumentTpl,
        };
        // Generate temp entry file
        const tempEntryPath = path.join(__dirname, 'tempEntry.js');
        fs.ensureFileSync(tempEntryPath);
        // Insert elements which define in app.json
        insertCommonElements(options.staticConfig);
        webpackConfig.entry[tempFile].push(`${loaderForDocument}?${qs.stringify(query)}!${tempEntryPath}`);
      }
    });

    let cachedHTML = {};

    let fileDependencies = [];

    /**
     * Make Document change can trigger dev server reload
     * Executed while initializing the compilation, right before emitting the compilation event.
     * Add file dependencies of child compiler to parent compiler to keep them watched
     */
    compiler.hooks.thisCompilation.tap(PLUGIN_NAME, (compilation) => {
      compilation.hooks.additionalChunkAssets.tap(PLUGIN_NAME, () => {
        const childCompilerDependencies = fileDependencies;

        childCompilerDependencies.forEach((fileDependency) => {
          compilation.compilationDependencies.add(fileDependency);
        });
      });
    });

    let lastHash;
    let currentHash;

    // Executed before finishing the compilation.
    compiler.hooks.make.tapAsync(PLUGIN_NAME, (mainCompilation, callback) => {
      /**
       * Need to run document compiler as a child compiler, so it can push html file to the web compilation assets.
       * Because there are other plugins get html file from the compilation of web.
       */
      const childCompiler = webpack(webpackConfig);
      childCompiler.parentCompilation = mainCompilation;

      // Run as child to get child compilation
      childCompiler.runAsChild((err, entries, childCompilation) => {
        if (err) {
          console.log(err);
        } else {
          fileDependencies = childCompilation.fileDependencies;
        }

        lastHash = currentHash;
        currentHash = childCompilation.hash;
        callback();
      });
    });

    // Render into index.html
    compiler.hooks.emit.tapAsync(PLUGIN_NAME, async (compilation, callback) => {
      // Render document to html only when hash change to avoid memory leak.
      if (currentHash !== lastHash) {
        cachedHTML = await generateHtml(compilation, {
          pages,
          publicPath,
          existDocument: !!this.documentPath,
        });
      }

      // eslint-disable-next-line
      for (const page in cachedHTML) {
        compilation.assets[page] = cachedHTML[page];
      }

      callback();
    });
  }
}

async function generateHtml(compilation, options) {
  const { pages, publicPath } = options;
  const entries = Object.keys(pages);

  let hasPrintError = false;

  const htmlMap = {};
  for (let i = 0, l = entries.length; i < l; i++) {
    const entryName = entries[i];
    const { tempFile, fileName } = pages[entryName];

    const files = compilation.entrypoints.get(entryName).getFiles();
    const assets = getAssetsForPage(files, publicPath);
    const documentContent = compilation.assets[`${tempFile}.js`].source();
    let pageSource;

    try {
      const Document: any = loadDocument(documentContent);
      if (options.existDocument) {
        const $ = generateHtmlStructure(Document.renderToHTML(assets));
        pageSource = $.html();
      } else {
        const initialHTML = Document.renderInitialHTML();
        const builtInDocumentTpl = Document.html;
        const $ = generateHtmlStructure(builtInDocumentTpl, {
          links: assets.styles.map((style) => `<link rel="stylesheet" href="${style}" />`),
          scripts: assets.scripts.map((script) => `<script src="${script}" />`),
        });
        const root = $('#root');
        root.html(initialHTML);
        pageSource = $.html();
      }
    } catch (error) {
      // eslint-disable-next-line no-await-in-loop
      const errorStack: any = await parse(error, documentContent);
      // Prevent print duplicate error info
      if (!hasPrintError) {
        print(error.message, errorStack);
        hasPrintError = true;
      }

      const stackMessage = errorStack.map((frame) => {
        if (frame.fromSourceMap) {
          return `at ${frame.functionName} (${frame.source}:${frame.lineNumber}:${frame.columnNumber})`;
        }
        // the origin source info already has position info
        return frame.source;
      });
      pageSource = `Error: ${error.message}<br>&nbsp;&nbsp;${stackMessage.join('<br>&nbsp;&nbsp;')}`;
    }

    htmlMap[fileName] = new RawSource(pageSource);

    delete compilation.assets[`${tempFile}.js`];
  }

  return htmlMap;
}

/**
 * Get path info from the output filename
 * 'web/[name].js' => 'web/'
 * '[name].js' => ''
 * @param {*} fileName webpack output file name
 */
function getPathInfoFromFileName(fileName) {
  const paths = fileName.split('/');
  paths.pop();
  return paths.length ? `${paths.join('/')}/` : '';
}

/**
 * Load Document after webpack compilation
 * @param {*} content document output
 */
function loadDocument(content) {
  const tempFn = new Function('require', 'module', content); // eslint-disable-line
  const tempModule = { exports: {} };
  tempFn(require, tempModule);
  if (Object.keys(tempModule.exports).length === 0) {
    throw new Error('Please make sure exports document component!');
  }

  return tempModule.exports;
}

/**
 * get assets from webpack outputs
 * @param {*} files [ 'web/detail.css', 'web/detail.js' ]
 * @param {*} publicPath
 */
function getAssetsForPage(files, publicPath) {
  const jsFiles = files.filter((v) => /\.js$/i.test(v));
  const cssFiles = files.filter((v) => /\.css$/i.test(v));

  return {
    // Support publicPath use relative path.
    // Change MPA 'pageName/index.js' to 'index.js', when use relative path.
    scripts: jsFiles.map((script) => publicPath + (publicPath.startsWith('.') ? path.basename(script) : script)),
    styles: cssFiles.map((style) => publicPath + (publicPath.startsWith('.') ? path.basename(style) : style)),
  };
}

/**
 * Get the exact file
 * @param {*} rootDir '/Document/work/code/rax-demo/'
 */
function getAbsoluteFilePath(rootDir, filePath) {
  const exts = ['.js', '.jsx', '.tsx'];

  const files = exts.map((ext) => {
    return `${path.join(rootDir, filePath)}${ext}`;
  });

  const targetFile = files.find((f) => fs.existsSync(f));

  return targetFile ? formatPath(targetFile) : null;
}
