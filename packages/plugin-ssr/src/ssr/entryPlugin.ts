import * as qs from 'qs';

interface IEntryPluginOptions {
  api: any;

  entries: any;
  documentPath: string;
}

const EntryLoader = require.resolve('./EntryLoader');

/**
 * An entry plugin which will set loader for entry before compile.
 */
export default class EntryPlugin {
  options: IEntryPluginOptions;
  constructor(options) {
    this.options = options;
  }
  /**
   * @param {Compiler} compiler the compiler instance
   * @returns {void}
   */
  apply(compiler) {
    const { api, entries, documentPath } = this.options;
    const query = {
      documentPath,
    };

    Object.keys(entries).forEach((entryName) => {
      compiler.options.entry[entryName] = `${EntryLoader}?${qs.stringify(query)}!${entries[entryName][0]}`;
    });
  }
}
