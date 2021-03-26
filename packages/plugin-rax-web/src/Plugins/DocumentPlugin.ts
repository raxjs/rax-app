import * as path from 'path';
import * as Module from 'module';
import * as cheerio from 'cheerio';
import { getEntriesByRoute } from '@builder/app-helpers';
import { registerListenTask, getAssets, getEnableStatus, updateEnableStatus } from '../utils/localBuildCache';
import * as webpackSources from 'webpack-sources';
import { getInjectedHTML, getBuiltInHtmlTpl, insertCommonElements } from '../utils/htmlStructure';

const PLUGIN_NAME = 'DocumentPlugin';
const { RawSource } = webpackSources;
export default class DocumentPlugin {
  options: any;
  init: boolean;
  constructor(options) {
    this.options = options;
  }
  apply(compiler) {
    const {
      pages,
      staticConfig,
      api: {
        context: {
          userConfig: { web: webConfig },
          rootDir,
        },
      },
      documentPath,
      insertScript,
    } = this.options;
    const { mpa, doctype = '<!DOCTYPE html>', ssr } = webConfig || {};
    // DEF plugin will pass publicPath override compiler publicPath in Weex Type App
    const publicPath = this.options.publicPath || compiler.options.output.publicPath;
    insertCommonElements(staticConfig);

    let localBuildTask = registerListenTask();

    compiler.hooks.emit.tapAsync(PLUGIN_NAME, async (compilation, callback) => {
      const enableStatus: boolean = getEnableStatus();
      if (enableStatus) {
        updateEnableStatus(false);
        localBuildTask.then(emitAssets).then(() => {
          localBuildTask = registerListenTask();
        });
      } else {
        emitAssets(getAssets());
      }
      function emitAssets(localBuildAssets) {
        const injectedHTML = getInjectedHTML();
        if (insertScript) {
          injectedHTML.scripts.push(`<script>${insertScript}</script>`);
        }
        pages.forEach(({ entryName, entryPath, path: pagePath, spm }) => {
          const buildResult = compilation.entrypoints.get(entryName).getFiles();
          const assets = getAssetsForPage(buildResult, publicPath);
          const title = getTitleByStaticConfig(staticConfig, {
            entryName,
            mpa,
            rootDir,
          });
          let html = '';
          if (documentPath && localBuildAssets[`${entryName}.js`]) {
            const bundleContent = localBuildAssets[`${entryName}.js`].source();
            const mod = exec(bundleContent, entryPath);
            html = mod.renderPage(assets, {
              doctype,
              title,
              pagePath,
            });

            const $ = cheerio.load(html, { decodeEntities: false });
            $('#root').after(injectedHTML.scripts);
            html = $.html();
          } else {
            let initialHTML;

            if (localBuildAssets[`${entryName}.js`]) {
              const bundleContent = localBuildAssets[`${entryName}.js`].source();
              const mod = exec(bundleContent, entryPath);
              initialHTML = mod.renderPage();
            }

            html = getBuiltInHtmlTpl({
              doctype,
              title,
              injectedHTML,
              assets,
              initialHTML,
              spmA: staticConfig.spm,
              spmB: spm,
            }, ssr);
          }

          compilation.assets[`${entryName}.html`] = new RawSource(html);
        });

        callback();
      }
    });
  }
}

function getTitleByStaticConfig(staticConfig, { entryName, mpa, rootDir }): string {
  if (!mpa) return staticConfig.window?.title;
  const route = staticConfig.routes
    .reduce((prev, curr) => {
      return [...prev, ...getEntriesByRoute(curr, rootDir)];
    }, [])
    .find(({ entryName: pageEntry }) => pageEntry === entryName);
  return route?.window?.title || staticConfig.window?.title;
}

/**
 * get assets from webpack outputs
 * @param {*} files [ 'detail.css', 'detail.js' ]
 * @param {*} publicPath
 */
function getAssetsForPage(files, publicPath) {
  const jsFiles = files.filter((v) => /\.js$/i.test(v));
  const cssFiles = files.filter((v) => /\.css$/i.test(v));

  return {
    // Support publicPath use relative path.
    // Change MPA 'pageName/index.js' to 'index.js', when use relative path.
    scripts: jsFiles.map((script) => {
      return publicPath + (publicPath.startsWith('.') ? path.basename(script) : script);
    }),
    links: cssFiles.map((style) => {
      return publicPath + (publicPath.startsWith('.') ? path.basename(style) : style);
    }),
  };
}

function exec(code, filePath) {
  const module: any = new Module(filePath, this);
  module.paths = (Module as any)._nodeModulePaths(filePath);
  module.filename = filePath;
  module._compile(code, filePath);
  return module.exports;
}
