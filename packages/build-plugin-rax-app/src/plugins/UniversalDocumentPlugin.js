const path = require('path');
const webpack = require('webpack');
const { RawSource } = require('webpack-sources');
const { createElement } = require('rax');
const { renderToString } = require('rax-server-renderer');
const { handleWebpackErr } = require('rax-compile-config');

const getSSRBaseConfig = require('../config/ssr/getBase');

const PLUGIN_NAME = 'UniversalDocumentPlugin';
const TEMP_FLIE_NAME = '_document.js';

module.exports = class UniversalDocumentPlugin {
  constructor(options) {
    if (!options.path) {
      throw new Error('Please specify document file location with the path attribute');
    }

    if (options.context) {
      this.context = options.context;
    }

    // for internal weex publish
    if (options.publicPath) {
      this.publicPath = options.publicPath;
    }
    // for internal weex publish
    if (options.insertScript) {
      this.insertScript = options.insertScript;
    }

    this.isMultiple = options.isMultiple;
    this.documentPath = options.path;
    this.command = options.command;
  }

  apply(compiler) {
    const config = compiler.options;
    const absoluteDocumentPath = path.resolve(config.context , this.documentPath);
    const publicPath = this.publicPath ? this.publicPath : config.output.publicPath;

    const documentWebpackConfig = getWebpackConfigForDocument(this.context, absoluteDocumentPath, config.output.path);

    let fileDependencies = [];
    let documentContent;

    // Executed while initializing the compilation, right before emitting the compilation event.
    compiler.hooks.thisCompilation.tap(PLUGIN_NAME, (compilation) => {

      // Add file dependencies of child compiler to parent compilerto keep them watched
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
          documentContent = childCompilation.assets[TEMP_FLIE_NAME].source();
        }

        callback();
      });
    });

    // Render into index.html
    compiler.hooks.emit.tapAsync(PLUGIN_NAME, (compilation, callback) => {
      const Document = loadDocument(documentContent, this.insertScript);
      const entryObj = config.entry;
      
      Object.keys(entryObj).forEach(entry => {
        const files = compilation.entrypoints.get(entry).getFiles();
        const assets = getAssetsForPage(files, publicPath);

        const DocumentContextProvider = function() {};
        DocumentContextProvider.prototype.getChildContext = function() {
          return {
            __styles: this.isMultiple ? assets.styles: [],
            __scripts: assets.scripts,
          };
        };
        DocumentContextProvider.prototype.render = function() {
          return createElement(Document);
        };

        const DocumentContextProviderElement = createElement(DocumentContextProvider);

        // get document html string
        const pageSource = `<!DOCTYPE html>${renderToString(DocumentContextProviderElement)}`;

        // insert html file
        compilation.assets[`web/${entry}.html`] = new RawSource(pageSource);

        delete compilation.assets[TEMP_FLIE_NAME];
      });

      callback();
    });
  }
};

/**
 * custom webpack config for document
 * @param {*} documentPath  document source path
 * @param {*} dest dest path
 */
function getWebpackConfigForDocument(context, documentPath, dest) {
  const webpackChainConfig = getSSRBaseConfig(context);

  webpackChainConfig
    .entry('document')
    .add(documentPath);
  
  webpackChainConfig.output
    .path(dest)
    .filename(TEMP_FLIE_NAME);
  
  webpackChainConfig.externals({
    rax: 'rax',
  });

  const documentWebpackConfig = webpackChainConfig.toConfig();

  return documentWebpackConfig;
}

function interopRequire(obj) {
  return obj && obj.__esModule ? obj.default : obj;
}

/**
 * load Document after webpack compilation
 * @param {*} content document output
 * @param {*} insertScript 
 */
function loadDocument(content, insertScript) {
  let fileContent  = content;

  if (insertScript) {
    const insertStr = `\n<script dangerouslySetInnerHTML={{__html: "${this.insertScript}"}} />`;
    fileContent = fileContent.replace(/(<body[^>]*>)/, `$1${insertStr}`);
  }

  const tempFn = new Function('require', 'module', fileContent); // eslint-disable-line
  const tempModule = { exports: {} };
  tempFn(require, tempModule);

  if (Object.keys(tempModule.exports).length === 0) {
    throw new Error('Please make sure exports document component!');
  }

  const Document = interopRequire(tempModule.exports);

  return Document;
}

/**
 * get assets from webpack outputs
 * @param {*} files 
 * @param {*} publicPath 
 */
function getAssetsForPage(files, publicPath) {
  const fileNames = files.filter(v => ~v.indexOf('.js'));

  const styles = [];
  if (fileNames && fileNames[0]) {
    // get the css file name by the entry bundle name
    const styleFileName = fileNames[0].replace('.js', '.css');
    styles.push(publicPath + styleFileName);
  }

  const scripts = fileNames.map(script => publicPath + script);

  return {
    scripts,
    styles,
  };
}
