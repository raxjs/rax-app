const { getEnhancedWebpackConfig } = require('@builder/user-config');
const getWebpackConfig = require('rax-webpack-config');
const getBabelConfig = require('rax-babel-config');
const ProgressPlugin = require('webpackbar');
const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const fs = require('fs-extra');
const ExportsFieldWebpackPlugin = require('@builder/exports-field-webpack-plugin').default;

module.exports = (api, { target, babelConfigOptions, progressOptions = {}, isNode }) => {
  const { context, onGetWebpackConfig } = api;
  const { rootDir, command, userConfig, webpack } = context;
  const { experiments = {} } = userConfig;
  const { exportsField } = experiments;

  const mode = command === 'start' ? 'development' : 'production';
  const babelConfig = getBabelConfig(babelConfigOptions);
  const webpackConfig = getWebpackConfig({
    rootDir,
    mode,
    babelConfig,
    target,
  });
  const enhancedWebpackConfig = getEnhancedWebpackConfig(api, {
    target,
    webpackConfig,
    babelConfig,
  });

  enhancedWebpackConfig
    .plugin('ProgressPlugin')
    .use(ProgressPlugin, [Object.assign({ color: '#F4AF3D' }, progressOptions)]);

  // Copy public dir
  if (fs.existsSync(path.resolve(rootDir, 'public'))) {
    enhancedWebpackConfig.plugin('CopyWebpackPlugin').use(CopyWebpackPlugin, [[]]);
  }

  ['jsx', 'tsx'].forEach((ruleName) => {
    enhancedWebpackConfig.module
      .rule(ruleName)
      .use('platform-loader')
      .loader(require.resolve('rax-platform-loader'))
      .options({
        platform: target === 'ssr' || isNode ? 'node' : target,
      });
  });

  onGetWebpackConfig(target, (config) => {
    // Set public url after developer has set public path
    // Get public path
    let publicUrl = config.output.get('publicPath');

    // Developer will use process.env.PUBLIC_URL + '/logo.png', so it need remove last /
    if (publicUrl && publicUrl.endsWith('/')) {
      publicUrl = publicUrl.substring(0, publicUrl.length - 1);
    }

    config.plugin('DefinePlugin').tap((args) => [
      Object.assign({}, ...args, {
        'process.env.PUBLIC_URL': JSON.stringify(publicUrl),
      }),
    ]);

    const { outputDir = 'build' } = userConfig;
    // Copy public dir
    if (config.plugins.has('CopyWebpackPlugin')) {
      config.plugin('CopyWebpackPlugin').tap(([copyList]) => {
        return [
          copyList.concat([
            {
              from: path.resolve(rootDir, 'public'),
              to: path.resolve(rootDir, outputDir, target),
            },
          ]),
        ];
      });
    }

    if (exportsField) {
      // Add condition names
      if (/^5\./.test(webpack.version)) {
        enhancedWebpackConfig.resolve.merge({
          conditionNames: [target],
        });
      } else {
        enhancedWebpackConfig.plugin('ExportsFieldWebpackPlugin').use(ExportsFieldWebpackPlugin, [
          {
            conditionNames: [target],
          },
        ]);
      }
    }

    // Set dev server content base
    config.devServer.contentBase(path.join(rootDir, outputDir));

    // Set output path
    config.output.path(path.resolve(rootDir, outputDir, target));
  });

  return enhancedWebpackConfig;
};
