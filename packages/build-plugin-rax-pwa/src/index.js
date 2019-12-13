const path = require('path');
const { readdirSync } = require('fs');

const pluginDir = path.join(__dirname, './plugins');
const pluginList = readdirSync(pluginDir);
module.exports = ({ onGetWebpackConfig, context }, option) => {
  const { command } = context;
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
