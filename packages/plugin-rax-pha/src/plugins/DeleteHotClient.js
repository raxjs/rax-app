const { PHA_WORKER_ENTRY_KEY } = require('../constants');

module.exports = class DeleteHotClient {
  constructor(options) {
    this.options = options;
  }
  apply(compiler) {
    compiler.hooks.entryOption.tap('DeleteHotClient', (context, entry) => {
      entry[PHA_WORKER_ENTRY_KEY] = [this.options.appWorkerPath];
    });
  }
};
