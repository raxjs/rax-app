const { resolve, relative, join, dirname } = require('path');
const {
  readFileSync,
  readJsonSync,
  writeJsonSync,
  ensureDirSync,
  copySync,
  copy,
  existsSync
} = require('fs-extra');
const ConcatSource = require('webpack-sources').ConcatSource;
const ModuleFilenameHelpers = require('webpack/lib/ModuleFilenameHelpers');
const { RawSource } = require('webpack-sources');
const chalk = require('chalk');
const adjustCss = require('./tool/adjust-css');
const deepMerge = require('./tool/deep-merge');
const includes = require('./tool/includes');
const { MINIAPP, WECHAT_MINIPROGRAM } = require('./constants');
const adapter = require('./adapter');

const PluginName = 'MiniAppRuntimePlugin';
const appJsTmpl = readFileSync(
  resolve(__dirname, './template/app.js'),
  'utf8'
);
const pageJsTmpl = readFileSync(
  resolve(__dirname, './template/page.js'),
  'utf8'
);

const appExtraCssTmpl = readFileSync(
  resolve(__dirname, './template/app.extra.css'),
  'utf8'
);
const appCssTmpl = readFileSync(
  resolve(__dirname, './template/app.css'),
  'utf8'
);
const customComponentJsTmpl = readFileSync(
  resolve(__dirname, './template/custom-component.js'),
  'utf8'
);
const projectConfigJsonTmpl = require('./template/project.config.json');

const globalVars = ['HTMLElement'];

/**
 * Add file to compilation
 */
function addFile(compilation, filename, content) {
  compilation.assets[filename] = {
    source: () => content,
    size: () => Buffer.from(content).length
  };
}

/**
 * Add content to chunks head and tail
 */
function wrapChunks(compilation, chunks) {
  chunks.forEach(chunk => {
    chunk.files.forEach(fileName => {
      if (ModuleFilenameHelpers.matchObject({ test: /\.js$/ }, fileName)) {
        // Page js
        const headerContent = 'module.exports = function(window, document) {const App = function(options) {window.appOptions = options};';

        const footerContent = '}';

        compilation.assets[fileName] = new ConcatSource(
          headerContent,
          compilation.assets[fileName],
          footerContent
        );
      }
    });
  });
}

/**
 * Get dependency file path
 */
function getAssetPath(
  assetPathPrefix,
  filePath,
  assetsSubpackageMap,
  selfFilePath
) {
  if (assetsSubpackageMap[filePath]) {
    assetPathPrefix = '';
  }

  return `${assetPathPrefix}./${relative(
    dirname(selfFilePath),
    filePath
  )}`;
}

function handlePageJS(
  compilation,
  assets,
  assetPathPrefix,
  assetsSubpackageMap,
  pageRoute,
  pageConfig,
  target
) {
  const addPageScroll = pageConfig && pageConfig.windowScroll;
  const reachBottom = pageConfig && pageConfig.reachBottom;
  const pullDownRefresh = pageConfig && pageConfig.pullDownRefresh;
  let pageJsContent = pageJsTmpl
    .replace(/APINamespace/g, adapter[target].APINamespace)
    .replace(/TARGET/g, `'${target}'`)
    .replace(
      '/* CONFIG_PATH */',
      `${getAssetPath(
        assetPathPrefix,
        'config.js',
        assetsSubpackageMap,
        `${pageRoute}.js`
      )}`
    )
    .replace(
      '/* INIT_FUNCTION */',
      `function init(window, document) {${assets.js
        .map(
          js =>
            `require('${getAssetPath(
              assetPathPrefix,
              js,
              assetsSubpackageMap,
              `${pageRoute}.js`
            )}')(window, document)`
        )
        .join(';')}}`
    );
  const pageScrollFunction = addPageScroll
    ? () =>
      'onPageScroll({ scrollTop }) {if (this.window) {this.window.document.documentElement.scrollTop = scrollTop || 0;this.window.$$trigger("scroll");}},'
    : '';
  const reachBottomFunction = reachBottom
    ? () =>
      'onReachBottom() {if (this.window) {this.window.$$trigger("reachbottom");}},'
    : '';
  const pullDownRefreshFunction = pullDownRefresh
    ? () =>
      'onPullDownRefresh() {if (this.window) {this.window.$$trigger("pulldownrefresh");}},'
    : '';

  pageJsContent = pageJsContent
    .replace('/* PAGE_SCROLL_FUNCTION */', pageScrollFunction)
    .replace('/* REACH_BOTTOM_FUNCTION */', reachBottomFunction)
    .replace('/* PULL_DOWN_REFRESH_FUNCTION */', pullDownRefreshFunction);

  addFile(compilation, `${pageRoute}.js`, pageJsContent);
}

function handlePageXML(
  compilation,
  customComponentRoot,
  pageRoute,
  target
) {
  let pageXmlContent = `<element ${
    adapter[target].directive.if
  }="{{pageId}}" class="{{bodyClass}}" data-private-node-id="e-body" data-private-page-id="{{pageId}}" ${
    customComponentRoot ? 'generic:custom-component="custom-component"' : ''
  }> </element>`;

  addFile(compilation, `${pageRoute}.${adapter[target].xml}`, pageXmlContent);
}

function handlePageCSS(
  compilation,
  pageConfig,
  assets,
  assetPathPrefix,
  assetsSubpackageMap,
  pageRoute,
  target
) {
  const pageBackgroundColor =
    pageConfig &&
    (pageConfig.pageBackgroundColor || pageConfig.backgroundColor); // Compatible with original backgroundColor

  let pageCssContent = assets.css
    .map(
      css =>
        `@import "${getAssetPath(
          assetPathPrefix,
          css,
          assetsSubpackageMap,
          `${pageRoute}.${adapter[target].css}`
        )}";`
    )
    .join('\n');
  if (pageBackgroundColor)
    pageCssContent = `page { background-color: ${pageBackgroundColor}; }\n${pageCssContent}`;
  addFile(
    compilation,
    `${pageRoute}.${adapter[target].css}`,
    adjustCss(pageCssContent)
  );
}

function handlePageJSON(
  compilation,
  pageExtraConfig,
  customComponentRoot,
  assetPathPrefix,
  pageRoute
) {
  const pageConfig = {
    ...pageExtraConfig,
    usingComponents: {
      element: 'miniapp-element'
    }
  };
  if (customComponentRoot) {
    pageConfig.usingComponents['custom-component'] = getAssetPath(
      assetPathPrefix,
      'custom-component/index',
      {},
      `${pageRoute}.js`
    );
  }
  addFile(compilation, `${pageRoute}.json`, JSON.stringify(pageConfig, null, 2));
}

function handleWebview(compilation, pages, { redirect }, target) {
  if (
    redirect &&
    (redirect.notFound === 'webview' || redirect.accessDenied === 'webview')
  ) {
    addFile(
      compilation,
      'pages/webview/index.js',
      'Page({data:{url:""},onLoad: function(query){this.setData({url:decodeURIComponent(query.url)})}})'
    );
    addFile(
      compilation,
      `pages/webview/index.${adapter[target].xml}`,
      '<web-view src="{{url}}"></web-view>'
    );
    addFile(compilation, `pages/webview/index.${adapter[target].css}`, '');
    addFile(compilation, 'pages/webview/index.json', '{"usingComponents":{}}');
    pages.push('pages/webview/index');
  }
}

function handleAppJS(compilation, appAssets, assetsSubpackageMap) {
  const appJsContent = appJsTmpl.replace(
    '/* INIT_FUNCTION */',
    `const fakeWindow = {};const fakeDocument = {};${appAssets.js
      .map(
        js =>
          `require('${getAssetPath(
            '',
            js,
            assetsSubpackageMap,
            'app.js'
          )}')(fakeWindow, fakeDocument)`
      )
      .join(';')};const appConfig = fakeWindow.appOptions || {};`
  );
  addFile(compilation, 'app.js', appJsContent);
}

function handleProjectConfig(compilation, { projectConfig = {} }, target) {
  if (target === WECHAT_MINIPROGRAM) {
    const userProjectConfigJson = projectConfig;
    const projectConfigJson = JSON.parse(JSON.stringify(projectConfigJsonTmpl));
    const projectConfigJsonContent = JSON.stringify(
      deepMerge(projectConfigJson, userProjectConfigJson),
      null,
      '\t'
    );
    addFile(compilation, 'project.config.json', projectConfigJsonContent);
  }
}

function handleSiteMap(compilation, { sitemapConfig }, target) {
  if (target === WECHAT_MINIPROGRAM) {
    const userSitemapConfigJson = sitemapConfig;
    if (userSitemapConfigJson) {
      const sitemapConfigJsonContent = JSON.stringify(
        userSitemapConfigJson,
        null,
        '\t'
      );
      addFile(compilation, 'sitemap.json', sitemapConfigJsonContent);
    }
  }
}

function handleConfigJS(compilation, optimization) {
  addFile(compilation, 'config.js', JSON.stringify({
    optimization
  }));
}

function handleCustomComponent(
  compilation,
  customComponentRoot,
  customComponents,
  outputPath,
  target
) {
  if (customComponentRoot) {
    copy(
      customComponentRoot,
      resolve(outputPath, 'custom-component/components')
    );

    const realUsingComponents = {};
    const names = Object.keys(customComponents);
    names.forEach(
      key =>
        realUsingComponents[
          key
        ] = `./components/${customComponents[key].path}`
    );

    // custom-component/index.js
    addFile(compilation, 'custom-component/index.js', customComponentJsTmpl);

    // custom-component/index.xml
    addFile(
      compilation,
      `custom-component/index.${adapter[target].xml}`,
      names
        .map((key, index) => {
          const { props = [], events = [] } = customComponents[key];
          return `<${key} ${adapter[target].directive.prefix}:${
            index === 0 ? 'if' : 'elif'
          }="{{name === '${key}'}}" id="{{id}}" class="{{class}}" style="{{style}}" ${props
            .map(name => `${name}="{{${name}}}"`)
            .join(' ')} ${events
            .map(name => `bind${name}="on${name}"`)
            .join(' ')}><slot/></${key}>`;
        })
        .join('\n')
    );

    // custom-component/index.css
    addFile(compilation, `custom-component/index.${adapter[target].css}`, '');

    // custom-component/index.json
    addFile(
      compilation,
      'custom-component/index.json',
      JSON.stringify(
        {
          component: true,
          usingComponents: realUsingComponents
        },
        null,
        '\t'
      )
    );
  }
}

function handleNodeModules(compilation) {
  addFile(compilation, 'node_modules/.miniprogram', '');
}

function installDependencies(
  stats,
  target,
  customComponentConfig = {},
  callback
) {
  const sourcePath = join(process.cwd(), 'src');
  const customComponentRoot =
    customComponentConfig.root &&
    resolve(sourcePath, customComponentConfig.root);

  const outputPath = resolve(stats.compilation.outputOptions.path);

  const build = () => {
    const outputNpmPath = resolve(outputPath, adapter[target].npmDirName);
    ensureDirSync(outputNpmPath);

    ['miniapp-element', 'miniapp-render'].forEach(name => {
      const sourceNpmFileDir = resolve(
        process.cwd(),
        'node_modules',
        name,
        'dist',
        adapter[target].fileName
      );
      const distNpmFileDir = resolve(
        outputPath,
        adapter[target].npmDirName,
        name
      );
      copySync(sourceNpmFileDir, distNpmFileDir);
      // Handle custom-component path in alibaba miniapp
      if (
        target === 'miniapp' &&
        customComponentRoot &&
        name === 'miniapp-element'
      ) {
        const elementJSONFilePath = resolve(distNpmFileDir, 'index.json');
        const elementJSONContent = readJsonSync(elementJSONFilePath);
        elementJSONContent.usingComponents['custom-component'] =
          '../../custom-component/index';
        writeJsonSync(elementJSONFilePath, elementJSONContent, { space: 2 });
      }
    });
  };
  console.log(
    chalk.green(`Start building deps for ${adapter[target].name}...`)
  );

  build();
  callback();
}

function handleWrapChunks(
  compilation,
  afterOptimizations,
  pluginName
) {
  if (afterOptimizations) {
    compilation.hooks.afterOptimizeChunkAssets.tap(pluginName, chunks => {
      wrapChunks(compilation, chunks);
    });
  } else {
    compilation.hooks.optimizeChunkAssets.tapAsync(
      pluginName,
      (chunks, callback) => {
        wrapChunks(compilation, chunks);
        callback();
      }
    );
  }
}

class MiniAppRuntimePlugin {
  constructor(options) {
    this.options = options;
    this.target = options.target || MINIAPP;
  }

  apply(compiler) {
    const options = this.options;
    const target = this.target;
    const config = options.config || {};

    compiler.hooks.emit.tapAsync(PluginName, (compilation, callback) => {
      const outputPath = join(compilation.outputOptions.path, target);
      const sourcePath = join(options.rootDir, 'src');
      const appJsEntryName = 'default';
      const routes = options.routes || {};
      const subpackagesConfig = config.subpackages || {};
      const customComponentConfig = config.nativeCustomComponent || {};
      const customComponentRoot =
        customComponentConfig.root &&
        resolve(sourcePath, customComponentConfig.root);
      const customComponents = customComponentConfig.usingComponents || {};
      const pages = [];
      const subpackagesMap = {}; // page - subpackage
      const assetsMap = {}; // page - asset
      const assetsReverseMap = {}; // asset - page
      const assetsSubpackageMap = {}; // asset - subpackage

      // Collect asset
      routes.forEach(({ entryName }) => {
        const assets = { js: [], css: [] };
        const filePathMap = {};
        const extRegex = /\.(css|js|wxss|acss)(\?|$)/;
        const entryFiles = compilation.entrypoints.get(entryName).getFiles();
        entryFiles.forEach(filePath => {
          // Skip non css or js
          const extMatch = extRegex.exec(filePath);
          if (!extMatch) return;

          // Skip recorded
          if (filePathMap[filePath]) return;
          filePathMap[filePath] = true;

          // Record
          let ext = extMatch[1];
          ext = ext === 'wxss' || ext === 'css' || ext === 'acss' ? 'css' : ext;
          assets[ext].push(filePath);

          // Insert into assetsReverseMap
          assetsReverseMap[filePath] = assetsReverseMap[filePath] || [];
          if (assetsReverseMap[filePath].indexOf(entryName) === -1)
            assetsReverseMap[filePath].push(entryName);

          // Adjust css content
          if (ext === 'css') {
            compilation.assets[
              `${filePath}.${adapter[target].css}`
            ] = new RawSource(adjustCss(compilation.assets[filePath].source()));
            delete compilation.assets[filePath];
          }
        });
        console.log('entryName', entryName);
        assetsMap[entryName] = assets;
        let pageConfig = {};
        const pageConfigPath = resolve(sourcePath, entryName);
        if (existsSync(pageConfigPath)) {
          pageConfig = readJsonSync(pageConfigPath);
        }
        const packageName = subpackagesMap[entryName];
        const pageRoute = `${packageName ? `${packageName}/` : ''}${entryName}`;
        const assetPathPrefix = packageName ? '../' : '';

        // Page js
        handlePageJS(
          compilation,
          assets,
          assetPathPrefix,
          assetsSubpackageMap,
          pageRoute,
          pageConfig,
          target
        );

        // Page xml
        handlePageXML(
          compilation,
          customComponentRoot,
          pageRoute,
          target
        );

        // Page css
        handlePageCSS(
          compilation,
          pageConfig,
          assets,
          assetPathPrefix,
          assetsSubpackageMap,
          pageRoute,
          target
        );

        // Page json
        handlePageJSON(
          compilation,
          pageConfig,
          customComponentRoot,
          assetPathPrefix,
          pageRoute
        );

        // Record page path
        if (!packageName) pages.push(pageRoute);
      });

      // Handle subpackage config
      Object.keys(subpackagesConfig).forEach(packageName => {
        const pages = subpackagesConfig[packageName] || [];
        pages.forEach(entryName => {
          subpackagesMap[entryName] = packageName;

          // Search private asset and put into subpackage
          const assets = assetsMap[entryName];
          if (assets) {
            [...assets.js, ...assets.css].forEach(filePath => {
              const requirePages = assetsReverseMap[filePath] || [];
              if (includes(pages, requirePages)) {
                assetsSubpackageMap[filePath] = packageName;
                compilation.assets[`../${packageName}/common/${filePath}`] =
                  compilation.assets[filePath];
                delete compilation.assets[filePath];
              }
            });
          }
        });
      });

      // Delete entry of app.js
      // const appJsEntryIndex = routes.indexOf(appJsEntryName);
      // if (appJsEntryIndex >= 0) entryNames.splice(appJsEntryIndex, 1);

      // Handle custom component
      Object.keys(customComponents).forEach(key => {
        if (typeof customComponents[key] === 'string') {
          customComponents[key] = {
            path: customComponents[key]
          };
        }
      });

      // Add webview page
      handleWebview(compilation, pages, options, target);

      const appAssets = assetsMap[appJsEntryName] || { js: [], css: [] };

      // App js
      handleAppJS(compilation, appAssets, assetsSubpackageMap);

      // Project.config.json
      handleProjectConfig(compilation, options, target);

      // Sitemap.json
      handleSiteMap(compilation, options, target);

      // Config js
      handleConfigJS(compilation, options.optimization);

      // Node_modules
      handleNodeModules(compilation);

      // Custom-component
      handleCustomComponent(
        compilation,
        customComponentRoot,
        customComponents,
        outputPath,
        target
      );

      callback();
    });

    compiler.hooks.compilation.tap(PluginName, compilation => {
      handleWrapChunks(
        compilation,
        this.afterOptimizations,
        PluginName
      );
    });

    compiler.hooks.done.tapAsync(PluginName, (stats, callback) => {
      // Install dependency automatically
      const customComponentConfig = config.nativeCustomComponent || {};
      installDependencies(
        stats,
        target,
        customComponentConfig,
        callback
      );
    });
  }
}

module.exports = MiniAppRuntimePlugin;
