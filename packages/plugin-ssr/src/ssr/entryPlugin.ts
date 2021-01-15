import * as qs from 'qs';

interface IEntryPluginOptions {
  api: any;

  entries: any;
  documentPath: string;
}

interface ILoaderQuery {
  documentPath?: string;
  entryName?: string;
  needInjectStyle?: boolean;

  publicPath?: string;
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
    const {
      context: {
        userConfig: { web, inlineStyle },
      },
    } = api;
    const { publicPath } = compiler.options.output;
    let query: ILoaderQuery;

    if (documentPath) {
      query = {
        needInjectStyle: web.mpa && !inlineStyle,
        documentPath,
        publicPath,
      };
    }

    Object.keys(entries).forEach((entryName) => {
      query.entryName = entryName;
      compiler.options.entry[entryName] = `${EntryLoader}?${qs.stringify(query || {})}!${entries[entryName][0]}`;
    });
  }
}
