import * as path from 'path';
import * as Module from 'module';
import * as cheerio from 'cheerio';
import * as htmlparser2 from 'htmlparser2';
import { getEntriesByRoute } from '@builder/app-helpers';
import { registerListenTask, getAssets, getEnableStatus, updateEnableStatus } from '../utils/localBuildCache';
import * as webpackSources from 'webpack-sources';
import { processAssets, emitAsset } from '@builder/compat-webpack4';
import { getInjectedHTML, getBuiltInHtmlTpl, insertCommonElements, genComboedScript } from '../utils/htmlStructure';
import { setDocument } from '../utils/document';
import { updateHTMLByEntryName } from '../utils/htmlCache';

const PLUGIN_NAME = 'DocumentPlugin';

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
          webpack,
        },
      },
      documentPath,
      insertScript,
    } = this.options;
    const { mpa, doctype = '<!DOCTYPE html>', ssr, staticExport } = webConfig || {};
    // DEF plugin will pass publicPath override compiler publicPath in Weex Type App
    const publicPath = this.options.publicPath || compiler.options.output.publicPath;
    insertCommonElements(staticConfig);

    let localBuildTask = registerListenTask();

    processAssets({
      compiler,
      pluginName: PLUGIN_NAME,
    }, ({ compilation, callback }) => {
      const enableStatus: boolean = getEnableStatus();
      if (enableStatus || (staticExport && !documentPath)) {
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
          const pageAssets = getAssetsForPage(buildResult, publicPath);
          const title = getTitleByStaticConfig(staticConfig, {
            entryName,
            mpa,
            rootDir,
          });
          let html = '';
          // PHA will consume document field
          let customDocument;
          if (documentPath && localBuildAssets[`${entryName}.js`]) {
            const bundleContent = localBuildAssets[`${entryName}.js`].source();
            const mod = exec(bundleContent, entryPath);

            try {
              html = mod.renderPage(pageAssets, {
                doctype,
                title,
                pagePath,
              });
            } catch (error) {
              compilation.errors.push(error);
              throw new Error(error.message);
            }

            const parserOptions = { decodeEntities: false };
            const $ = cheerio.load(htmlparser2.parseDOM(html, parserOptions), parserOptions);
            if (injectedHTML.comboScripts.length) {
              // Insert comboed script
              $('#root').after([genComboedScript(injectedHTML.comboScripts), ...injectedHTML.scripts]);
              html = $.html();
              // Remove comboed script and insert decomboed scripts
              $('.__combo_script__').replaceWith(injectedHTML.comboScripts.map(({ script }) => script));
              customDocument = $.html();
            } else {
              $('#root').after(injectedHTML.scripts);
              html = $.html();
              customDocument = html;
            }
          } else {
            let initialHTML;

            if (localBuildAssets[`${entryName}.js`]) {
              const bundleContent = localBuildAssets[`${entryName}.js`].source();
              const mod = exec(bundleContent, entryPath);

              try {
                initialHTML = mod.renderPage();
              } catch (error) {
                compilation.errors.push(error);
                throw new Error(error.message);
              }
            }

            html = getBuiltInHtmlTpl({
              doctype,
              title,
              injectedHTML,
              assets: pageAssets,
              initialHTML,
              spmA: staticConfig.spm,
              spmB: spm,
            }, ssr);
          }

          setDocument(entryName, html);
          const { RawSource } = webpack.sources || webpackSources;
          updateHTMLByEntryName(entryName, html);
          emitAsset(compilation, `${entryName}.html`, new RawSource(html));
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
  const jsFiles = files.filter((v) => /\.js$/i.test(v) && !/\.hot-update\.js$/i.test(v));
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
