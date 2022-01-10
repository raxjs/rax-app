const { getEnhancedWebpackConfig } = require('@builder/user-config');
const getWebpackConfig = require('rax-webpack-config').default;
const getBabelConfig = require('rax-babel-config');
const ProgressPlugin = require('webpackbar');
const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const fs = require('fs-extra');
const ExportsFieldWebpackPlugin = require('@builder/exports-field-webpack-plugin').default;
const { isWebpack4 } = require('@builder/compat-webpack4');
const { MINIAPP_PLATFORMS, SSR, DOCUMENT } = require('./constants');

module.exports = (api, { target, babelConfigOptions, progressOptions = {} }) => {
  const { context, onGetWebpackConfig } = api;
  const { rootDir, command, userConfig } = context;
  let mpa = false;

  // subPackages is miniapp config, mpa is web/weex/kraken config
  // document and ssr need be the same as web
  if (MINIAPP_PLATFORMS.includes(target)) {
    mpa = (userConfig[target] || {}).subPackages;
  } else if ([SSR, DOCUMENT].includes(target)) {
    mpa = (userConfig.web || {}).mpa;
  } else if (userConfig[target]) {
    mpa = userConfig[target].mpa;
  }

  const mode = command === 'start' ? 'development' : 'production';
  const babelConfig = getBabelConfig(babelConfigOptions);
  const webpackConfig = getWebpackConfig({
    rootDir,
    mode,
    babelConfig,
    target,
    webpackVersion: context.webpack.version,
  });
  const enhancedWebpackConfig = getEnhancedWebpackConfig(api, {
    target,
    webpackConfig,
    babelConfig,
  });

  // dynamic import script cross origin
  enhancedWebpackConfig.output.crossOriginLoading('anonymous');

  enhancedWebpackConfig.module
    .rule('appJSON')
    .type('javascript/auto')
    .test(/(\/|\\)app\.json$/)
    .use('swc-loader')
    .loader(require.resolve('@builder/swc-loader'))
    .options({
      jsc: {
        target: 'es5',
      },
      module: {
        type: 'commonjs',
        ignoreDynamic: true,
      },
    })
    .end()
    .use('route-loader')
    .loader(require.resolve('./Loaders/RouteLoader'))
    .options({
      target,
      mpa,
    })
    .end();

  enhancedWebpackConfig
    .plugin('ProgressPlugin')
    .use(ProgressPlugin, [Object.assign({ color: '#F4AF3D' }, progressOptions)]);

  // Copy public dir
  if (fs.existsSync(path.resolve(rootDir, 'public'))) {
    enhancedWebpackConfig.plugin('CopyWebpackPlugin').use(CopyWebpackPlugin, [[]]);
  }

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

    const { outputDir = 'build', swc } = userConfig;
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

    const conditionNames = [target, 'import', 'require', 'node'];

    // Add condition names
    if (isWebpack4) {
      config.plugin('ExportsFieldWebpackPlugin').use(ExportsFieldWebpackPlugin, [
        {
          conditionNames,
        },
      ]);
      // Set dev server content base
      config.devServer.contentBase(path.join(rootDir, outputDir));
      // Reset config target
      config.target('web');
    } else {
      config.resolve.merge({
        conditionNames,
      });

      // Set dev server content base
      config.devServer.merge({
        static: {
          directory: path.join(rootDir, outputDir),
        },
      });
    }

    // Set output path
    config.output.path(path.resolve(rootDir, outputDir, target));

    // Only save target code
    const keepPlatform = ['ssr', 'document'].includes(target) ? 'node' : target;
    ['jsx', 'tsx'].forEach((ruleName) => {
      config.module
        .rule(ruleName)
        .use('platform-loader')
        .loader(require.resolve('rax-platform-loader'))
        .options({
          platform: keepPlatform,
        });
    });

    if (swc) {
      ['jsx', 'tsx'].forEach((suffix) => {
        config.module
          .rule(`swc-${suffix}`)
          .use('swc-loader')
          .tap((options) => {
            return {
              ...options,
              keepPlatform,
            };
          });
      });
    }

    // TODO: hack for tslib wrong exports field https://github.com/microsoft/tslib/issues/161
    config.resolve.alias.set('tslib', 'tslib/tslib.es6.js');
  });

  return enhancedWebpackConfig;
};
