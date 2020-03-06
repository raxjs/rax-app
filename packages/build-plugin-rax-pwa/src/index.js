const path = require('path');
const { readdirSync } = require('fs');

const getNSRBase = require('./nsr/getBase');
const setNSRBuild = require('./nsr/setBuild');

const pluginDir = path.join(__dirname, './plugins');
const pluginList = readdirSync(pluginDir);
module.exports = ({ onGetWebpackConfig, context, registerTask }, option) => {
  const { nsr } = option;
  const { command } = context;

  // register nsr plugin
  if (nsr) {
    const nsrConfig = getNSRBase(context);
    registerTask('nsr', nsrConfig);

    if (command === 'build') {
      onGetWebpackConfig('nsr', (config) => {
        setNSRBuild(config, context);
      });
    }
  }

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
