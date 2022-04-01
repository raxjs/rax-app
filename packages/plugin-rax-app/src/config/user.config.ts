import { validation } from '@builder/app-helpers';
import { isWebpack4 } from '@builder/compat-webpack4';

const devServerDefaultOptionsMap = {
  webpack4: {
    allowedHosts: 'all',
    compress: true,
    // Use 'ws' instead of 'sockjs-node' on server since webpackHotDevClient is using native websocket
    disableHostCheck: true,
    logLevel: 'silent',
    transportMode: 'ws',
    sockPath: '/ws',
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
    allowedHosts: 'all',
    compress: true,
    hot: true,
    static: {
      watch: {
        ignored: /node_modules/,
        aggregateTimeout: 600,
      },
    },
    client: {
      overlay: {
        errors: true,
        warnings: false,
      },
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

export default [
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
