import * as path from 'path';
import * as Module from 'module';
import * as cheerio from 'cheerio';
import { registerListenTask, getCacheAssets, getEnableStatus, updateEnableStatus } from '../utils/localBuildCache';
import * as webpackSources from 'webpack-sources';
import { getInjectedHTML, getBuiltInHtmlTpl, insertCommonElements } from '../utils/htmlStructure';

const PLUGIN_NAME = 'DocumentPlugin';
const { RawSource } = webpackSources;
export default class DocumentPlugin {
  options: any;
  constructor(options) {
    this.options = options;
  }
  apply(compiler) {
    const {
      pages,
      staticConfig,
      api: {
        context: {
          userConfig: { web = {} },
        },
      },
      documentPath,
      insertScript,
    } = this.options;
    // DEF plugin will pass publicPath override compiler publicPath in Weex Type App
    const publicPath = this.options.publicPath || compiler.options.output.publicPath;
    const doctype = web.doctype || '<!DOCTYPE html>';
    insertCommonElements(staticConfig);

    let localBuildTask = registerListenTask();

    compiler.hooks.emit.tapAsync(PLUGIN_NAME, async (compilation, callback) => {
      const enableListen = getEnableStatus();
      /**
       * 1. Exist local builder, before local builder compiler created (it's more earlier than this hook) enable listen will be true,
       *  so it will resolve the first listen resolve, and then hot reload:
       *  - Something changed that will emit web and local builder all restart, it will be ok as the first one:
       *    - web builder is faster than local builder, enable status has been true when restart(before local builder compiler created), so it will wait local builder emits assets
       *    - local builder is faster than web builder, localBuildTask is ready to resolve when web finished
       *  - Something changed that will only emit web changed:
       *    - the enableListen status has been false when latest emitted, so it will use the last time cache assets as html content
       */
      if (enableListen) {
        localBuildTask.then(emitAssets);
      } else {
        const cacheAssets = getCacheAssets();
        emitAssets(cacheAssets);
      }

      function emitAssets(localBuildAssets) {
        // update local build task
        localBuildTask = registerListenTask();
        // update enable status
        updateEnableStatus(false);
        const injectedHTML = getInjectedHTML();
        if (insertScript) {
          injectedHTML.scripts.push(`<script>${insertScript}</script>`);
        }
        pages.forEach(({ entryName, entryPath, path: pagePath, spm }) => {
          const buildResult = compilation.entrypoints.get(entryName).getFiles();
          const assets = getAssetsForPage(buildResult, publicPath);
          const title = getTitleByStaticConfig(staticConfig, {
            entryName,
            mpa: web.mpa,
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
            $('head').append(injectedHTML.scripts);
            html = $.html();
          } else {
            let initialHTML = '';

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
            });
          }

          compilation.assets[`${entryName}.html`] = new RawSource(html);
        });

        callback();
      }
    });
  }
}

function getTitleByStaticConfig(staticConfig, { entryName, mpa }): string {
  if (!mpa) return staticConfig.window?.title;
  const route = staticConfig.routes.find(({ source, name }) => {
    let pageEntry;
    if (name) {
      pageEntry = name;
    } else if (source) {
      const dir = path.dirname(source);
      pageEntry = path.parse(dir).name.toLocaleLowerCase();
    }
    return pageEntry === entryName;
  });
  return route.window?.title || staticConfig.window?.title;
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
