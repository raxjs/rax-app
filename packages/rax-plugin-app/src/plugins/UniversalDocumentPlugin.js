const path = require('path');
const webpack = require('webpack');
const { RawSource } = require('webpack-sources');
const { readFileSync, existsSync, unlinkSync } = require('fs');
const { createElement } = require('rax');
const { DocumentContext } = require('rax-document');
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
  }

  apply(compiler) {
    const config = compiler.options;

    const absoluteDocumentPath = path.resolve(config.context , this.documentPath);
    const absoluteOutputPath = path.join(config.output.path, TEMP_FLIE_NAME);
    const publicPath = this.publicPath ? this.publicPath : config.output.publicPath;

    const documentWebpackConfig = getWebpackConfigForDocument(absoluteDocumentPath, config.output.path);

    // Compile Document
    compiler.hooks.beforeCompile.tapAsync(PLUGIN_NAME, (compilation, callback) => {
      webpack(documentWebpackConfig).run((err, stats) => {
        handleWebpackErr(err, stats);
        callback();
      });
    });

    // Render into index.html
    compiler.hooks.emit.tapAsync(PLUGIN_NAME, (compilation, callback) => {
      const Document = loadDocument(absoluteOutputPath, this.insertScript);
      const entryObj = config.entry;
      
      Object.keys(entryObj).forEach(entry => {
        const files = compilation.entrypoints.get(entry).getFiles();
        const assets = getAssetsForPage(files, publicPath);

        const context = {
          styles: this.isMultiple ? assets.styles: [],
          scripts: assets.scripts,
        };

        const documentElement = createElement(DocumentContext.Provider, {
          value: context,
        }, createElement(Document, null));

        // get document html string
        const pageSource = `<!DOCTYPE html>${renderToString(documentElement)}`;

        // insert html file
        compilation.assets[`web/${entry}.html`] = new RawSource(pageSource);
      });

      callback();
    });

    // Delete temp file
    compiler.hooks.done.tap(PLUGIN_NAME, () => {
      if (config.mode === 'production' || !config.mode) {
        if (existsSync(absoluteOutputPath)) {
          unlinkSync(absoluteOutputPath);
        }
      }
    });
  }
};

/**
 * custom webpack config for document
 * @param {*} documentPath  document source path
 * @param {*} dest dest path
 */
function getWebpackConfigForDocument(documentPath, dest) {
  const webpackChainConfig = getSSRBaseConfig({
    isSSR: true,
  });

  webpackChainConfig
    .entry('document')
    .add(documentPath);
  
  webpackChainConfig.output
    .path(dest)
    .filename(TEMP_FLIE_NAME);
  
  webpackChainConfig.externals({
    rax: 'rax',
    'rax-document': 'rax-document',
  });

  const documentWebpackConfig = webpackChainConfig.toConfig();

  return documentWebpackConfig;
}

function interopRequire(obj) {
  return obj && obj.__esModule ? obj.default : obj;
}

/**
 * load Document after webpack compilation
 * @param {*} documentPath document output path
 * @param {*} insertScript 
 */
function loadDocument(documentPath, insertScript) {
  if (!existsSync(documentPath)) throw new Error(`File ${documentPath} is not exists, please check.`);
      
  let fileContent = readFileSync(documentPath, 'utf-8');

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
    styles.push(`${publicPath}${styleFileName}`);
  }

  const scripts = fileNames.map(script => `${publicPath}${script}`);

  return {
    scripts,
    styles,
  };
}