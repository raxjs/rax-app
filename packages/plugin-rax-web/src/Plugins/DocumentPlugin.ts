import * as path from 'path';
import * as Module from 'module';
import { registerListenTask } from '../utils/localBuildCache';
import * as webpackSources from 'webpack-sources';
import { getInjectedHTML, getBuiltInHtmlTpl } from '../utils/htmlStructure';

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
          userConfig: { web },
        },
      },
    } = this.options;
    const { publicPath } = compiler.options.output;

    let localBuildTask = registerListenTask();

    compiler.hooks.emit.tapAsync(PLUGIN_NAME, async (compilation, callback) => {
      localBuildTask.then((localBuildAssets) => {
        // update local build task
        localBuildTask = registerListenTask();
        const injectedHTML = getInjectedHTML();
        pages.forEach(({ entryName, entryPath }) => {
          const buildResult = compilation.entrypoints.get(entryName).getFiles();
          const assets = getAssetsForPage(buildResult, publicPath);
          const title = getTitleByStaticConfig(staticConfig, {
            entryName,
            mpa: web.mpa,
          });
          let initialHTML = '';

          if (localBuildAssets[`${entryName}.js`]) {
            const bundleContent = localBuildAssets[`${entryName}.js`].source();
            const mod = exec(bundleContent, entryPath);
            initialHTML = mod.renderPage();
          }

          const html = getBuiltInHtmlTpl({
            doctype: web.doctype,
            title,
            scripts: [...injectedHTML.scripts, ...assets.scripts],
            links: [...injectedHTML.links, ...assets.links],
            metas: injectedHTML.metas,
            initialHTML,
          });
          compilation.assets[`${entryName}.html`] = new RawSource(html);
        });

        callback();
      });
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
      const src = publicPath + (publicPath.startsWith('.') ? path.basename(script) : script);
      return `<script crossorigin="anonymous" type="application/javascript" src="${src}"></script>`;
    }),
    links: cssFiles.map((style) => {
      const href = publicPath + (publicPath.startsWith('.') ? path.basename(style) : style);
      return `<link rel="stylesheet" href="${href}" />`;
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
