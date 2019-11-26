const path = require('path');
const webpack = require('webpack');
const { RawSource } = require('webpack-sources');
const { existsSync, readFileSync, unlinkSync } = require('fs');
const { createElement } = require('rax');
const { renderToString } = require('rax-server-renderer');

const NAME = 'PWAAppShellPlugin';
const FILE_NAME = '__PWA_APP_SHELL__';

const interopRequire = (obj) => {
  return obj && obj.__esModule ? obj.default : obj;
};

// The App-Shell component will be pre-rendered to index.html.
// When user loaded entry javascript file, it will hydrate the App-Shell component.
module.exports = class PWAAppShellPlugin {

  apply(compiler) {
    const config = compiler.options;
    const appJSON = path.resolve(config.context, 'src/app.json');

    if (!existsSync(appJSON)) {
      return;
    }

    const appConfig = JSON.parse(readFileSync(appJSON, 'utf-8'));

    // Only Web projects are supported. Effective when the user set shell
    if (config.target !== 'web' || !appConfig.shell) return;

    // It's must have source config
    if (!appConfig.shell.source) {
      throw new Error('Please make sure shell config contains source!');
    }

    const file = path.resolve(config.context, `src/${appConfig.shell.source}`);
    // build/web/[FILE_NAME].js
    const outputFile = path.join(config.output.path, config.output.filename.replace('[name]', FILE_NAME));

    // Compile App-Shell
    compiler.hooks.beforeCompile.tapAsync(NAME, (compilationParams, callback) => {
      // externals rax, update libraryTarget, disabled self plugin
      const newConfig = Object.assign({}, config, {
        target: 'node',
        externals: {
          rax: 'rax',
        },
        entry: { [FILE_NAME]: [file] },
        output: Object.assign({}, config.output, { libraryTarget: 'commonjs2' }),
        plugins: config.plugins.filter(plugin => plugin !== this),
      });

      try {
        /**
         * rax-compile-config platformLoader will translate universal-env
         * @example isWeb=true
         * 
         * before:
         * import { isWeb, isWeex } from 'universal-env';
         *
         * after:
         * const isWeb = true;
         * const isWeex = false
         * 
         * App shell will be rendered with Node.js, Some code in wrong environment will throw error.
         * Find platformLoader 'web' env and translate to the right environment 'node'
         */
        const rules = config.module.rules;
        for (let i = 0, l = rules.length; i < l; i++) {
          const rulesTestStr = rules[i].test.toString();
          // Find jsx and tsx rule
          if (rulesTestStr.indexOf('jsx') > -1 || rulesTestStr.indexOf('tsx') > -1) {
            // Find platformLoader
            const platformLoaderIdx = rules[i].use.findIndex(opt => opt.loader.indexOf('platformLoader') > -1);
            // If it contains platformLoader and target env is 'web', change to 'node'
            if (platformLoaderIdx > -1 && rules[i].use[platformLoaderIdx].options.platform === 'web') {
              newConfig.module.rules[i].use[platformLoaderIdx].options = { platform: 'node' };
            }
          }
        }
      } catch (err) {
        // ignore
      }

      webpack(newConfig).run(() => {
        callback();
      });
    });

    // Render into index.html
    compiler.hooks.emit.tapAsync(NAME, (compilation, callback) => {
      try {
        const tempCode = readFileSync(outputFile, 'utf-8');
        const tempFn = new Function('require', 'module', tempCode); // eslint-disable-line
        const tempModule = { exports: {} };
        tempFn(require, tempModule);

        if (Object.keys(tempModule.exports).length === 0) {
          throw new Error('Please make sure exports app shell component!');
        }

        const AppShell = interopRequire(tempModule.exports);
        const content = renderToString(createElement(AppShell, {}));

        // Pre-render App-Shell renderToString element to index.html
        const entryObj = compilation.options.entry;
        Object.keys(entryObj).forEach(entry => {
          const pageHtmlValue = compilation.assets[`web/${entry}.html`].source();
          compilation.assets[`web/${entry}.html`] = new RawSource(pageHtmlValue.replace(
            /<div(.*?) id="root">(.*?)<\/div>/,
            `<div id="root">${content}</div>`
          ));
        });
        callback();
      } catch (err) {
        console.error('\n App Shell `renderToString` failed with Node.js: \n This issue usually happens because when app shell is rendered on the server.');
        if (err.message.indexOf('document') > -1 || err.message.indexOf('window') > -1) {
          console.error('It does not have a document or window object on the server side and those objects are only available on the browser.');
          console.error('Try to call the document or window functions in or after componentDidMount.');
        }
        console.error('Detail: \n');
        throw err;
      }
    });

    // Delete temp files
    compiler.hooks.done.tap(NAME, () => {
      if (config.mode === 'production' || !config.mode) {
        const mapFile = `${outputFile}.map`;
        const htmlFile = outputFile.replace(/\.js$/, '.html');

        existsSync(outputFile) && unlinkSync(outputFile);
        existsSync(mapFile) && unlinkSync(mapFile);
        existsSync(htmlFile) && unlinkSync(htmlFile);
      }
    });
  }
};
