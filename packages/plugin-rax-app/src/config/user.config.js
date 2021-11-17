const { validation } = require('@builder/app-helpers');
const { isWebpack4 } = require('@builder/compat-webpack4');

const devServerDefaultOptionsMap = {
  webpack4: {
    compress: true,
    // Use 'ws' instead of 'sockjs-node' on server since webpackHotDevClient is using native websocket
    disableHostCheck: true,
    logLevel: 'silent',
    transportMode: 'ws',
    quiet: false,
    publicPath: '/',
    clientLogLevel: 'none',
    watchOptions: {
      ignored: /node_modules/,
      aggregateTimeout: 600,
    },
    before(app) {
      app.use((req, res, next) => {
        // set cros for all served files
        res.set('Access-Control-Allow-Origin', '*');
        next();
      });
    },
    hot: true,
    // For mutilple task, web will occupy the server root route
    writeToDisk: true,
    historyApiFallback: true,
  },
  webpack5: {
    compress: true,
    hot: true,
    static: {
      watch: {
        ignored: /node_modules/,
        aggregateTimeout: 600,
      },
    },
    client: {
      overlay: false,
      logging: 'none',
    },
    onBeforeSetupMiddleware({ app }) {
      app.use((req, res, next) => {
        // set cros for all served files
        res.set('Access-Control-Allow-Origin', '*');
        next();
      });
    },
    // For mutilple task, web will occupy the server root route
    devMiddleware: {
      writeToDisk: true,
      publicPath: '/',
    },
    liveReload: false,
    historyApiFallback: true,
  },
};

const webpackVersion = isWebpack4 ? 'webpack4' : 'webpack5';

const devServerDefaultOptions = devServerDefaultOptionsMap[webpackVersion];

/* eslint global-require: 0 */
module.exports = [
  {
    name: 'devServer',
    validation: 'object',
    defaultValue: devServerDefaultOptions,
  },
  {
    name: 'outputAssetsPath',
    defaultValue: {
      js: '',
      css: '',
    },
  },
  {
    name: 'inlineStyle',
    defaultValue: false,
    configWebpack: require('../userConfig/atoms/inlineStyle'),
    validation: (val) => {
      return validation('inlineStyle', val, 'boolean|object');
    },
  },
  {
    name: 'polyfill',
    defaultValue: false,
  },
  {
    name: 'compileDependencies',
    defaultValue: [''],
  },
  {
    name: 'vendor',
    defaultValue: true,
    configWebpack: require('../userConfig/atoms/vendor'),
  },
  {
    name: 'webpack5',
    defaultValue: false,
  },
  {
    name: 'terserOptions',
    validation: 'object',
    defaultValue: {},
  },
  {
    name: 'esbuild',
    validation: 'object',
  },
];
