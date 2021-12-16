import * as queryString from 'query-string';
import * as path from 'path';
import * as fs from 'fs-extra';
import { modifyEntry } from '@builder/compat-webpack4';
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
      log,
    } = api;
    const { publicPath } = compiler.options.output;
    const staticConfig = getValue(STATIC_CONFIG);
    const { updateDataInClient } = web.ssr;
    const pageConfig = getPageConfig(api, staticConfig);

    if (!updateDataInClient) {
      log.info('Enabled inject initial data into HTML.');
    }

    let query: ILoaderQuery = {
      tempPath: getValue(TEMP_PATH),
      updateDataInClient,
    };

    if (documentPath) {
      query = {
        ...query,
        needInjectStyle: web.mpa && !inlineStyle,
        documentPath,
        publicPath,
        injectedHTML: JSON.stringify(applyMethod('rax.getInjectedHTML')),
        assetsProcessor,
        doctype: web.doctype,
      };
    }

    const coreRunAppPath = path.join(query.tempPath, 'core/runApp');

    Object.keys(entries).forEach((entryName) => {
      const entryPaths = entries[entryName];
      // Transform hmr-loader.js!entryPath to [hmr-loader, entryPath]
      const entrySeparatedLoader = entryPaths[entryPaths.length - 1].split('!');
      // Get the real entry path
      const entry = entrySeparatedLoader[entrySeparatedLoader.length - 1];
      query.entryName = entryName;

      if (web.mpa) {
        query.pageConfig = JSON.stringify(pageConfig[entryName]);
        const entryFolder = path.dirname(entry);
        // Check runApp path
        let runAppPath = path.join(entryFolder, 'runApp');
        if (!fs.existsSync(`${runAppPath}.ts`)) {
          // Use core runApp path as default runApp implement
          runAppPath = coreRunAppPath;
        }
        query.runAppPath = runAppPath;
      } else {
        query.runAppPath = coreRunAppPath;
      }
      modifyEntry(compiler, {
        entryName,
        entryPath: `${EntryLoader}?${queryString.stringify(query)}!${entry}`,
      });
    });
  }
}
