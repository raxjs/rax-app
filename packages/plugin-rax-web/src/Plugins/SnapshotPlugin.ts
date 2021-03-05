
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

const PLUGIN_NAME = 'SnapshotPlugin';
const { RawSource } = webpackSource;
const { minify } = htmlMinifier;
export default class SnapshotPlugin {
  options: { withSSR: any };
  constructor(options) {
    this.options = options;
  }

  apply(compiler) {
    const { withSSR } = this.options;

    compiler.hooks.emit.tapAsync(PLUGIN_NAME, (compilation, callback) => {
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
      Object.keys(compilation.assets).forEach((assetName) => {
        if (/\.html$/.test(assetName)) {
          // In order to rendering faster, using inline script.
          compilation.assets[assetName] = new RawSource(
            minify(
              compilation.assets[assetName].source().replace('<script ', `<script>${processSnapshot}</script><script `),
              { minifyJS: true },
            ),
          );
        }
      });
      callback();
    });
  }
}
