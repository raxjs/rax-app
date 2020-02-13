const getSSRBase = require('./ssr/getBase');
const setSSRBuild = require('./ssr/setBuild');
const setSSRDev = require('./ssr/setDev');

const setWebDev = require('./web/setDev');

// can‘t clone webpack chain object
module.exports = ({ onGetWebpackConfig, registerTask, context }) => {
  process.env.RAX_SSR = 'true';
  const { command } = context;
  const ssrConfig = getSSRBase(context);
  registerTask('ssr', ssrConfig);

  if (command === 'build') {
    onGetWebpackConfig('ssr', (config) => {
      setSSRBuild(config, context);
    });
  }

  if (command === 'start') {
    onGetWebpackConfig('ssr', (config) => {
      setSSRDev(config, context);
    });
    onGetWebpackConfig('web', (config) => {
      setWebDev(config, context);
    });
  }
};
