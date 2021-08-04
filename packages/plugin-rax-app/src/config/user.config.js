const { validation } = require('@builder/app-helpers');

/* eslint global-require: 0 */
module.exports = [
  {
    name: 'devServer',
    defaultValue: {
      compress: true,
      // Use 'ws' instead of 'sockjs-node' on server since webpackHotDevClient is using native websocket
      // TODO: webpack5
      // disableHostCheck: true,
      // logLevel: 'silent',
      // transportMode: 'ws',
      // quiet: false,
      // publicPath: '/',
      // clientLogLevel: 'none',
      hot: true,
      // TODO: webpack5
      // watchOptions: {
      //   ignored: /node_modules/,
      //   aggregateTimeout: 600,
      // },
      // TODO: webpack5
      // before(app) {
      //   app.use((req, res, next) => {
      //     // set cros for all served files
      //     res.set('Access-Control-Allow-Origin', '*');
      //     next();
      //   });
      // },
      static: {
        watch: {
          ignored: /node_modules/,
          aggregateTimeout: 600,
        },
      },
      onBeforeSetupMiddleware(app) {
        app.use((req, res, next) => {
          // set cros for all served files
          res.set('Access-Control-Allow-Origin', '*');
          next();
        });
      },
      // For mutilple task, web will occupy the server root route
      // TODO: webpack5
      devMiddleware: {
        writeToDisk: true,
        publicPath: '/',
      },
      historyApiFallback: true,
    },
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
    configWebpack: require('../userConfig/inlineStyle'),
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
    configWebpack: require('../userConfig/vendor'),
  },
];
