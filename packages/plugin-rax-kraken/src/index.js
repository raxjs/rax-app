const setMPAConfig = require('@builder/mpa-config');
const { getMpaEntries } = require('@builder/app-helpers');
const { emitAsset, processAssets } = require('@builder/compat-webpack4');
const webpackSources = require('webpack-sources');
const Qjsc = require('qjsc');

const { getInjectContent, getInjectJS, getInjectStyle } = require('./generator');
const setEntry = require('./setEntry');
const { GET_RAX_APP_WEBPACK_CONFIG } = require('./constants');

const target = 'kraken';

module.exports = (api) => {
  const { getValue, context, registerTask, onGetWebpackConfig, applyMethod } = api;
  const { userConfig = {}, webpack } = context;
  const { RawSource } = webpack.sources || webpackSources;
  const getWebpackBase = getValue(GET_RAX_APP_WEBPACK_CONFIG);
  const tempDir = getValue('TEMP_PATH');
  const chainConfig = getWebpackBase(api, {
    target,
    babelConfigOptions: { styleSheet: userConfig.inlineStyle },
    progressOptions: {
      name: 'Kraken',
    },
  });
  chainConfig.name(target);
  chainConfig.taskName = target;

  setEntry(chainConfig, context);

  registerTask(target, chainConfig);

  onGetWebpackConfig(target, (config) => {
    const { command } = context;
    const krakenConfig = userConfig.kraken || {};
    const staticConfig = getValue('staticConfig');

    if (krakenConfig.mpa) {
      setMPAConfig.default(api, config, {
        type: 'kraken',
        targetDir: tempDir,
        entries: getMpaEntries(api, {
          target,
          appJsonContent: staticConfig,
        }),
      });
    }

    if (command === 'start') {
      applyMethod('rax.injectHotReloadEntries', config);
    }
  });

  onGetWebpackConfig(target, (config) => {
    config
      .plugin('BuildKBCPlugin')
      .use(class BuildKBCPlugin {
        apply(compiler) {
          const qjsc = new Qjsc();
          processAssets({
            pluginName: 'BuildKBCPlugin',
            compiler,
          }, ({ compilation, assets, callback }) => {
            const injected = applyMethod('rax.getInjectedHTML');

            Object.keys(assets).forEach((chunkFile) => {
              if (/\.js$/i.test(chunkFile)) {
                const kbcFilename = chunkFile.replace(/(\.js)$/i, '.kbc1');
                const cssFilename = chunkFile.replace(/(\.js)$/i, '.css');

                let injectCode = '';

                const appendCode = (code) => {
                  injectCode += code;
                };

                if (injected.metas.length > 0) {
                  appendCode(getInjectContent(injected.metas.join(''), 'document.head'));
                }

                if (injected.links.length > 0) {
                  appendCode(getInjectContent(injected.links.join(''), 'document.head'));
                }

                if (injected.scripts.length > 0) {
                  appendCode(getInjectContent(injected.scripts.join('')));
                }

                if (injected.comboScripts.length > 0) {
                  const comboUrl = 'https://g.alicdn.com/??' + injected.comboScripts.map(s => s.src).join(',');
                  appendCode(getInjectJS(comboUrl));
                }

                if (cssFilename in assets) {
                  // Inject to load non-inlined css file.
                  const css = assets[cssFilename];
                  appendCode(getInjectStyle(css.source()));
                }

                const jsContent = assets[chunkFile].source();
                const bytecode = qjsc.compile(injectCode + '\n' + jsContent);
                emitAsset(compilation, kbcFilename, new RawSource(bytecode));
              }
            });
            callback();
          });
        }
      });
  });
};
