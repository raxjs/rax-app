const path = require('path');
const fs = require('fs-extra');
const setEntry = require('./setEntry');

const pluginDir = path.join(__dirname, './plugins');
const pluginList = fs.readdirSync(pluginDir);

module.exports = (api, option) => {
  const { onGetWebpackConfig, context, registerTask, registerUserConfig, getValue } = api;
  const { command } = context;

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
    setEntry(context, config, 'ts');
    setEntry(context, config, 'js');

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
  });
};
