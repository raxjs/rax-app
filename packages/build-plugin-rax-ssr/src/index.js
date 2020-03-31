const getSSRBase = require('./ssr/getBase');
const setSSRBuild = require('./ssr/setBuild');
const setSSRDev = require('./ssr/setDev');

const setWebDev = require('./web/setDev');

// can‘t clone webpack chain object
module.exports = ({ onGetWebpackConfig, registerTask, context, getValue, setValue }) => {
  process.env.RAX_SSR = 'true';
  const { command } = context;
  const ssrConfig = getSSRBase(context, getValue);
  registerTask('ssr', ssrConfig);

  // Add ssr to the target list, so other plugins can get the right target info, eg. build-plugin-rax-compat-react
  const targets = getValue('targets');
  targets.push('ssr');
  setValue('targets', targets);

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
