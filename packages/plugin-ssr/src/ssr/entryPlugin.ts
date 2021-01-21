import * as qs from 'qs';
import { IEntryPluginOptions, ILoaderQuery } from '../types';
import { STATIC_CONFIG, TEMP_PATH } from '../constants';
import getPageConfig from '../utils/getPageConfig';

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
    const { api, entries, documentPath, assetsProcessor } = this.options;
    const {
      context: {
        userConfig: { web, inlineStyle },
      },
      getValue,
      applyMethod,
    } = api;
    const { publicPath } = compiler.options.output;
    const staticConfig = getValue(STATIC_CONFIG);
    const pageConfig = getPageConfig(staticConfig);

    let query: ILoaderQuery = {
      tempPath: getValue(TEMP_PATH),
      useRunApp: !web.mpa,
    };

    if (documentPath) {
      query = {
        ...query,
        needInjectStyle: web.mpa && !inlineStyle,
        documentPath,
        publicPath,
        injectedHTML: applyMethod('rax.getInjectedHTML'),
        assetsProcessor,
        doctype: web.doctype,
      };
    }

    Object.keys(entries).forEach((entryName) => {
      query.entryName = entryName;
      if (web.mpa) {
        query.pageConfig = pageConfig[entryName];
      }
      const entryPaths = entries[entryName];
      compiler.options.entry[entryName] = `${EntryLoader}?${qs.stringify(query || {})}!${
        entryPaths[entryPaths.length - 1]
      }`;
    });
  }
}
