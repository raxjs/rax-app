const path = require('path');
const fs = require('fs-extra');
const { RawSource } = require('webpack-sources');
const address = require('address');

const manifestHelpers = require('./manifestHelpers');

const { transformAppConfig, setRealUrlToManifest } = manifestHelpers;

const pluginDir = path.join(__dirname, './plugins');
const pluginList = fs.readdirSync(pluginDir);
module.exports = (api, option) => {
  const { onGetWebpackConfig, context, registerTask, registerUserConfig, getValue } = api;
  const { userConfig, command, rootDir, commandArgs } = context;
  const { outputDir = 'build' } = userConfig;

  const getWebpackBase = getValue('getRaxAppWebpackConfig');
  const target = 'PHA';
  const chainConfig = getWebpackBase(api, {
    target,
  });
  chainConfig.name(target);

  registerTask(target, chainConfig);
  registerUserConfig({
    name: target,
    validation: 'object',
  });

  onGetWebpackConfig(target, (config) => {
    function setEntry(type) {
      const appWorkerPath = path.resolve(rootDir, 'src/pha-worker' + (type === 'ts' ? '.ts' : '.js'));
      if (fs.pathExistsSync(appWorkerPath)) {
        config
          .entry('pha-worker')
          .add(appWorkerPath)
          .end()
          .output
          .path(path.resolve(rootDir, outputDir, 'web'))
          .filename('[name].js')
          .libraryTarget('umd')
          .globalObject('this')
          .end()
          .devServer
          .inline(false)
          .hot(false);
      }
    }

    setEntry('ts');
    setEntry('js');

    // do not copy public
    if (config.plugins.has('CopyWebpackPlugin')) {
      config.plugin('CopyWebpackPlugin').tap(() => {
        return [
          [],
        ];
      });
    }
  });

  onGetWebpackConfig('web', (config) => {
    pluginList.forEach((plugin) => {
      if (/\.js$/.test(plugin)) {
        config.plugin(plugin.replace(/\.js$/, ''))
          .use(require(`${pluginDir}/${plugin}`), [{
            ...option,
            context,
            command,
          }]);
      }
    });

    // app.json to manifest.json
    config.plugin('ManifestJSONPlugin')
      .use(class ManifestJSONPlugin {
        apply(compiler) {
          compiler.hooks.compilation.tap('ManifestJSONPlugin', (compilation) => {
            compiler.hooks.emit.intercept({
              name: 'ManifestJSONPlugin',
              context: true,
              call: () => {
                const appConfig = fs.readJsonSync(path.resolve(rootDir, 'src/app.json'));
                let manifestJSON = transformAppConfig(appConfig);

                const appWorkerJSPath = path.resolve(rootDir, 'src/pha-worker.js');
                const appWorkerTSPath = path.resolve(rootDir, 'src/pha-worker.ts');

                if (fs.pathExistsSync(appWorkerJSPath) || fs.pathExistsSync(appWorkerTSPath)) {
                  manifestJSON.app_worker = manifestJSON.app_worker || {};

                  if (!manifestJSON.app_worker.url) {
                    manifestJSON.app_worker.url = 'pha-worker.js';
                  }
                }

                if (command === 'start') {
                  const urlPrefix = 'http://' + address.ip() + ':' + commandArgs.port + '/';
                  manifestJSON = setRealUrlToManifest(urlPrefix, manifestJSON);
                }
                compilation.assets['manifest.json'] = new RawSource(JSON.stringify(manifestJSON));
              },
            });
          });
        }
      });
  });
};
