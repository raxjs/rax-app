import * as qs from 'qs';
import * as path from 'path';
import * as fs from 'fs-extra';
import { formatPath } from '@builder/app-helpers';
import { IEntryLoaderQuery } from '../types';
import { STATIC_CONFIG } from '../constants';
import getBuiltInHtmlTpl from './getBuiltInHTML';

const TEMP_PATH = 'TEMP_PATH';

/**
 * An entry plugin which will set loader for entry before compile.
 *
 * Entry Loader for SSR need `publicPath` for assets path.
 * `publicPath` may be changed by other plugin after SSR plugin.
 * So the real `publicPath` can only get after all plugins have registed.
 */
export default class EntryPlugin {
  options: any;
  constructor(options) {
    this.options = options;
  }

  /**
   * @param {Compiler} compiler the compiler instance
   * @returns {void}
   */
  apply(compiler) {
    const { entries, api, assetsProcessor } = this.options;
    const { context, getValue, applyMethod } = api;
    const { userConfig, rootDir } = context;
    const { web: webConfig, inlineStyle } = userConfig;
    const staticConfig = getValue(STATIC_CONFIG);
    const globalTitle = staticConfig.window && staticConfig.window.title;
    const tempPath = getValue(TEMP_PATH);
    const documentPath = getAbsolutePath(path.join(rootDir, 'src/document/index'));
    const absoluteAppConfigPath = getAbsolutePath(path.join(tempPath, 'appConfig.ts'));
    const { publicPath } = compiler.options.output;
    const EntryLoader = documentPath
      ? require.resolve('./loaders/customDocumentLoader')
      : require.resolve('./loaders/builtInHTMLLoader');

    const entryConfig = {};

    entries.forEach((entry) => {
      const { name, entryPath, source } = entry;

      const query: IEntryLoaderQuery = {
        styles: webConfig.mpa && !inlineStyle ? [`${publicPath}${name}.css`] : [],
        scripts: webConfig.mpa ? [`${publicPath}${name}.js`] : [`${publicPath}index.js`],
        absoluteAppConfigPath,
        entryPath,
        assetsProcessor,
      };

      if (documentPath) {
        query.documentPath = documentPath;
      } else {
        const targetRoute = staticConfig.routes.find((route) => route.source === source);
        const htmlInfo = {
          doctype: webConfig.doctype,
          title: targetRoute?.window?.title || globalTitle,
        };
        query.builtInHTML = getBuiltInHtmlTpl(htmlInfo);
        query.styles = query.styles.map((style) => `<link rel="stylesheet" type="text/css" href="${style}">`);
        query.scripts = query.scripts.map((script) => `<script src="${script}" />`);
        query.injectedHTML = applyMethod('RAX_GET_INJECTED_HTML');
      }

      entryConfig[name] = `${EntryLoader}?${qs.stringify(query)}!${entryPath}`;
    });

    compiler.options.entry = entryConfig;
  }
}

function getAbsolutePath(targetPath) {
  const targetExt = ['', '.tsx', '.jsx'].find((ext) => fs.existsSync(`${targetPath}${ext}`));
  if (targetExt === undefined) return;
  return formatPath(`${targetPath}${targetExt}`);
}
