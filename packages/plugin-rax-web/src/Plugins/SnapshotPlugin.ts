
/**
 * Snapshot Plugin
 * Store the innerHTML of the root element when the page is onload, and we call this innerHTML as snapshot.
 * When you visit the same page, the snapshot will be rendered first, and then hydrate the root element.
 * PHA_SnapshotPlugin can make the page render faster.
 *
 * 1. save snapshot when onload
 * 2. innerHTML the snapshot when the page has its snapshot
 */

import * as webpackSource from 'webpack-sources';
import * as htmlMinifier from 'html-minifier';
import * as webpack from 'webpack';
import { processAssets, emitAsset } from '@builder/compat-webpack4';

const PLUGIN_NAME = 'SnapshotPlugin';
const { RawSource } = webpack.sources || webpackSource;
const { minify } = htmlMinifier;
export default class SnapshotPlugin {
  options: { withSSR: any };
  constructor(options) {
    this.options = options;
  }

  apply(compiler) {
    const { withSSR } = this.options;

    processAssets({
      pluginName: PLUGIN_NAME,
      compiler,
    }, ({ compilation, assets, callback }) => {
      const processSnapshot = `
      var pathname = window.location.pathname;
      var hash = window.location.hash.replace('#', '') || '/';
      var storageKey = '__INITIAL_HTML_' + ${withSSR ? 'pathname' : 'hash'} + '__';
      var __INITIAL_HTML__ = localStorage.getItem(storageKey);
      if(__INITIAL_HTML__) {
        document.getElementById('root').innerHTML = __INITIAL_HTML__;
      }

      window.addEventListener("load", function (event) {
        localStorage.setItem(storageKey, this.document.getElementById('root').innerHTML);
      });
    `;
      Object.keys(assets).forEach((assetName) => {
        if (/\.html$/.test(assetName)) {
          const content = assets[assetName].source();
          // In order to rendering faster, using inline script.
          delete assets[assetName];
          emitAsset(compilation, assetName, new RawSource(
            minify(
              content.replace('<script ', `<script>${processSnapshot}</script><script `),
              { minifyJS: true },
            ),
          ));
        }
      });
      callback();
    });
  }
}
