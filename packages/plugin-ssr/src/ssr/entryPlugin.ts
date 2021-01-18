import * as qs from 'qs';
import * as path from 'path';
import { IEntryPluginOptions, ILoaderQuery } from '../types';

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
        rootDir,
        userConfig: { web, inlineStyle },
      },
      getValue,
      applyMethod,
    } = api;
    const { publicPath } = compiler.options.output;
    let query: ILoaderQuery = {
      appConfigPath: path.join(rootDir, getValue('TEMP_PATH'), 'appConfig.ts'),
    };

    if (documentPath) {
      query = {
        ...query,
        needInjectStyle: String(web.mpa && !inlineStyle),
        documentPath,
        publicPath,
        injectedHTML: applyMethod('rax.getInjectedHTML'),
      };
    }

    Object.keys(entries).forEach((entryName) => {
      query.entryName = entryName;
      compiler.options.entry[entryName] = `${EntryLoader}?${qs.stringify(query || {})}!${entries[entryName][0]}`;
    });
  }
}
