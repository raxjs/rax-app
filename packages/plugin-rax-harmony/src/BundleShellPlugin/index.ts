import { processAssets, emitAsset } from '@builder/compat-webpack4';
import * as webpackSources from 'webpack-sources';
import * as webpack from 'webpack';
import { IBundleShellPluginOptions } from '../types';
import { DEVICE_LEVEL } from '../constants';
import LiteShell from './LiteShell';
import RichShell from './RichShell';
import getPageName from '../utils/getPageName';

const PLUGIN_NAME = 'BundleShell';
const { RawSource } = webpack.sources || webpackSources;


export default class BundleShell {
  pluginOptions: IBundleShellPluginOptions = {
    appType: 'rich',
    manifest: {},
  };
  options: any;
  constructor(options: IBundleShellPluginOptions) {
    this.pluginOptions = options;
  }
  apply(compiler) {
    processAssets({
      pluginName: PLUGIN_NAME,
      compiler,
    }, ({ assets, callback, compilation }) => {
      Object.keys(assets)
        .forEach((filename) => {
          let outputFileName = filename.replace(/\.js$/, '');
          if (!/^app\.js(\.map)?$/.test(filename)) {
            outputFileName = `pages/${getPageName(filename)}`;
          }
          if (/\.js$/.test(filename)) {
            transformJSFile(filename, { compilation, assets, pluginOptions: this.pluginOptions, outputFileName: `${outputFileName}.js` });
          }

          if (/\.js\.map$/.test(filename)) {
            moveMapFile(filename, { compilation, assets, outputFileName: `${outputFileName}.js.map` });
          }
        });

      // Generate manifest.json
      emitAsset(compilation, 'manifest.json',
        new RawSource(
          JSON.stringify(this.pluginOptions.manifest, null, compiler.options.mode === 'production' ? 0 : 2),
        ));
      callback();
    });
  }
}

function transformJSFile(filename: string, { compilation, assets, pluginOptions, outputFileName }) {
  const originalContent = assets[filename].source?.();
  delete assets[filename];

  const shellOptions = {
    filename,
  };
  const shell = pluginOptions.appType === DEVICE_LEVEL.LITE
    ? new LiteShell(originalContent, pluginOptions, shellOptions)
    : new RichShell(originalContent, pluginOptions, shellOptions);

  emitAsset(compilation, outputFileName, new RawSource(shell.generate()));
}

function moveMapFile(filename: string, { compilation, assets, outputFileName }) {
  const originalContent = assets[filename];
  delete assets[filename];

  emitAsset(compilation, outputFileName, originalContent);
}
