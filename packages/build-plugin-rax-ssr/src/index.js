const path = require('path');
const chalk = require('chalk');
const getSSRBase = require('./ssr/getBase');
const setSSRBuild = require('./ssr/setBuild');
const setSSRDev = require('./ssr/setDev');

const setWebDev = require('./web/setDev');

// can‘t clone webpack chain object
module.exports = ({ onGetWebpackConfig, registerTask, context, getValue, setValue, onHook }) => {
  process.env.RAX_SSR = 'true';

  const { command, rootDir, userConfig = {} } = context;
  const { outputDir } = userConfig;

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

  onHook('after.build.compile', ({ err, stats }) => {
    console.log(chalk.green('[SSR] Bundle at:'));
    console.log('   ', chalk.underline.white(path.resolve(rootDir, outputDir, 'node')));
    console.log();
  });
};
