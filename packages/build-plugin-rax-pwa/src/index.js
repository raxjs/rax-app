const path = require('path');
const { readdirSync } = require('fs');
const setManifestToDocument = require('./setManifestToDocument');

const getNSRBase = require('./nsr/getBase');

const pluginDir = path.join(__dirname, './plugins');
const pluginList = readdirSync(pluginDir);
module.exports = ({ onGetWebpackConfig, context, registerTask }, option) => {
  const { nsr } = option;
  const { command } = context;

  // register nsr plugin
  if (nsr && nsr.enable) {
    const nsrConfig = getNSRBase(context);
    registerTask('nsr', nsrConfig);
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

    setManifestToDocument({
      ...option,
      context,
      config
    });
  });
};
