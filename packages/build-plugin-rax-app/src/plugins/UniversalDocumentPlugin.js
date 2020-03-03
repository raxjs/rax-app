const fs = require('fs');
const path = require('path');
const webpack = require('webpack');
const { RawSource } = require('webpack-sources');
const { handleWebpackErr } = require('rax-compile-config');
const getDocumentBaseConfig = require('../config/document/getBase');

const PLUGIN_NAME = 'UniversalDocumentPlugin';

module.exports = class UniversalDocumentPlugin {
  constructor(options) {
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
    compiler.hooks.emit.tapAsync(PLUGIN_NAME, async(compilation, callback) => {
      for(let i = 0, n = pages.length ; i < n ; i ++ ) {
        const page = pages[i];
        const { entryName } = page;

        const documentContent = compilation.assets[`__doucment_for_${entryName}.js`].source();

        const Document = loadDocument(documentContent);
        const pageSource = await Document.renderToHTML();

        // insert html file
        compilation.assets[`${outputFilePrefix}${entryName}.html`] = new RawSource(pageSource);

        delete compilation.assets[`__doucment_for_${entryName}.js`];
      }

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
    return `${path.join(rootDir, filePath)}${ext}`
  });

  return files.find((f) => fs.existsSync(f));
}
