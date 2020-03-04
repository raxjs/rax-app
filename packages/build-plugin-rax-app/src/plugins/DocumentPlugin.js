const fs = require('fs');
const path = require('path');
const webpack = require('webpack');
const { RawSource } = require('webpack-sources');
const { handleWebpackErr } = require('rax-compile-config');
const getDocumentBaseConfig = require('../config/document/getBase');

const PLUGIN_NAME = 'DocumentPlugin';

module.exports = class DocumentPlugin {
  constructor(options) {
    /**
     * An plugin which generate HTML files
     * @param {object} options
     * @param {object} options.context build plugin context
     * @param {object[]} options.pages pages need to generate HTML
     * @param {string} options.pages[].entryName
     * @param {string} options.pages[].path  page path in route config
     * @param {string} options.pages[].source page path in route config
     * @param {boolean} [options.staticExport] static exporting
     * @param {string} [options.loader] custom document loader
     * @param {string} [options.publicPath] for internal weex publish
     * @param {function} [options.configWebpack] custom webpack config for document
     */
    this.options = options;
  }

  apply(compiler) {
    const mainConfig = compiler.options;
    const { context, ...options} = this.options;
    const { pages } = options;

    options.webConfig = mainConfig;

    const config = getDocumentBaseConfig(context, options);
    const documentWebpackConfig = config.toConfig();

    // Get output dir from filename instead of hard code.
    const outputFileName = mainConfig.output.filename;
    const outputFilePrefix = getPathInfoFromFileName(outputFileName);

    let fileDependencies = [];

    /**
     * Make Document change can trigger dev server reload
     * Executed while initializing the compilation, right before emitting the compilation event.
     * Add file dependencies of child compiler to parent compiler to keep them watched
     */
    compiler.hooks.thisCompilation.tap(PLUGIN_NAME, (compilation) => {
      compilation.hooks.additionalChunkAssets.tap(PLUGIN_NAME, () => {
        const childCompilerDependencies = fileDependencies;

        childCompilerDependencies.forEach(fileDependency => {
          compilation.compilationDependencies.add(fileDependency);
        });
      });
    });

    // Executed before finishing the compilation.
    compiler.hooks.make.tapAsync(PLUGIN_NAME, (mainCompilation, callback) => {
      const childCompiler = webpack(documentWebpackConfig);
      childCompiler.parentCompilation = mainCompilation;

      // Run as child to get child compilation
      childCompiler.runAsChild((err, entries, childCompilation) => {
        if (err) {
          handleWebpackErr(err);
        } else {
          fileDependencies = childCompilation.fileDependencies;
        }

        callback();
      });
    });

    // Render into index.html
    compiler.hooks.emit.tapAsync(PLUGIN_NAME, (compilation, callback) => {
      pages.forEach(page => {
        const { entryName } = page;

        const documentTempFile = '__' + entryName.replace(/\//g, '_') + '_doucment.js';
        const documentContent = compilation.assets[documentTempFile].source();

        const Document = loadDocument(documentContent);
        const pageSource = Document.renderToHTML();

        // insert html file
        compilation.assets[`${outputFilePrefix}${entryName}.html`] = new RawSource(pageSource);

        delete compilation.assets[documentTempFile];
      });

      callback();
    });
  }
};

/**
 * Get path info from the output filename
 * 'web/[name].js' => 'web/'
 * '[name].js' => ''
 * @param {*} fileName webpack output file name
 */
function getPathInfoFromFileName(fileName) {
  const paths = fileName.split('/');
  paths.pop();
  return paths.length ? paths.join('/') + '/' : '';
}

/**
 * load Document after webpack compilation
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

function getAbsoluteFilePath(rootDir, filePath) {
  const exts = ['.js', '.jsx', '.tsx'];

  const files = exts.map((ext) => {
    return `${path.join(rootDir, filePath)}${ext}`;
  });

  return files.find((f) => fs.existsSync(f));
}
