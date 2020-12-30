import setWebDev from './web/setDev';
import * as path from 'path';
import * as chalk from 'chalk';
import getSSRBase from './ssr/getBase';
import setSSRBuild from './ssr/setBuild';
import setSSRDev from './ssr/setDev';

// can‘t clone webpack chain object
export default (api) => {
  const { onGetWebpackConfig, registerTask, context, onHook } = api;
  const { command, rootDir, userConfig = {} } = context;
  const { outputDir } = userConfig;

  const ssrConfig = getSSRBase(api);
  const isDev = command === 'start';

  registerTask('ssr', ssrConfig);

  if (isDev) {
    onGetWebpackConfig('web', (config) => {
      config.optimization.splitChunks({ cacheGroups: {} });
      setWebDev(config);
    });
  }

  onGetWebpackConfig('ssr', (config) => {
    config.target('node');

    // do not generate vendor.js when compile document
    config.optimization.splitChunks({ cacheGroups: {} });

    config.devServer.writeToDisk(true);

    config.output
      .filename('node/[name].js')
      .libraryTarget('commonjs2');

    if (isDev) {
      setSSRDev(config, api);
    } else {
      setSSRBuild(config);
    }

    config
      .plugin('DefinePlugin')
      .tap((args) => [Object.assign({}, ...args, {
        'process.env.__IS_SERVER__': true,
      })]);
  });

  onHook('after.build.compile', () => {
    console.log(chalk.hex('#F4AF3D')('[SSR] Bundle at:'));
    console.log('   ', chalk.underline.white(path.resolve(rootDir, outputDir, 'node')));
    console.log();
  });
};
