const { PHA_WORKER_ENTRY_KEY } = require('../constants');

const PLUGIN_NAME = 'DeleteHotClient';

module.exports = class DeleteHotClient {
  constructor(options) {
    this.options = options;
  }
  apply(compiler) {
    const finalEntry = [this.options.appWorkerPath];

    // webpack4 or low version webpack5
    compiler.hooks.entryOption.tap(PLUGIN_NAME, (context, entry) => {
      entry[PHA_WORKER_ENTRY_KEY] = Array.isArray(entry[PHA_WORKER_ENTRY_KEY]) ? finalEntry : {
        import: finalEntry,
      };
    });

    // webpack5
    compiler.hooks.normalModuleFactory.tap(PLUGIN_NAME, (normalModuleFactory) => {
      normalModuleFactory.hooks.beforeResolve.tapAsync(PLUGIN_NAME, (data, callback) => {
        if (
          data.request.includes('webpack/hot') ||
          data.request.includes('webpack-dev-server/client')
        ) {
          return callback(null, false);
        }
        callback();
      });
    });
  }
};
