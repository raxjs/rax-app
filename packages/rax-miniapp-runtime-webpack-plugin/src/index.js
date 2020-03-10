const path = require('path');
const {
  readFileSync,
  readJsonSync,
  writeJsonSync,
  ensureDirSync,
  copySync,
  copy
} = require('fs-extra');
const ConcatSource = require('webpack-sources').ConcatSource;
const ModuleFilenameHelpers = require('webpack/lib/ModuleFilenameHelpers');
const { RawSource } = require('webpack-sources');
const pathToRegexp = require('path-to-regexp');
const chalk = require('chalk');
const adjustCss = require('./tool/adjust-css');
const deepMerge = require('./tool/deep-merge');
const includes = require('./tool/includes');
const defaultConfig = require('./defaultConfig');
const { MINIAPP, WECHAT_MINIPROGRAM } = require('./constants');
const adapter = require('./adapter');

const PluginName = 'MiniAppRuntimePlugin';
const appJsTmpl = readFileSync(
  path.resolve(__dirname, './template/app.js'),
  'utf8'
);
const pageJsTmpl = readFileSync(
  path.resolve(__dirname, './template/page.js'),
  'utf8'
);
const appDisplayCssTmpl = readFileSync(
  path.resolve(__dirname, './template/app.display.css'),
  'utf8'
);
const appExtraCssTmpl = readFileSync(
  path.resolve(__dirname, './template/app.extra.css'),
  'utf8'
);
const appCssTmpl = readFileSync(
  path.resolve(__dirname, './template/app.css'),
  'utf8'
);
const customComponentJsTmpl = readFileSync(
  path.resolve(__dirname, './template/custom-component.js'),
  'utf8'
);
const projectConfigJsonTmpl = require('./template/project.config.json');

process.env.isMiniprogram = true; // Set env variable
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
function wrapChunks(compilation, chunks, globalVarsConfig) {
  chunks.forEach(chunk => {
    chunk.files.forEach(fileName => {
      if (ModuleFilenameHelpers.matchObject({ test: /\.js$/ }, fileName)) {
        // Page js
        const headerContent = `module.exports = function(window, document) {const App = function(options) {window.appOptions = options};${globalVars
          .map(item => `var ${item} = window.${item}`)
          .join(';')};`;
        let customHeaderContent = globalVarsConfig
          .map(
            item =>
              `var ${item[0]} = ${item[1] ? item[1] : `window['${item[0]}']`}`
          )
          .join(';');
        customHeaderContent = customHeaderContent
          ? `${customHeaderContent};`
          : '';
        const footerContent = '}';

        compilation.assets[fileName] = new ConcatSource(
          headerContent + customHeaderContent,
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
  console.log('selfFilePath', selfFilePath);
  console.log('filePath', filePath);
  console.log('relative', path.relative(
    path.dirname(selfFilePath),
    filePath
  ));
  return `${assetPathPrefix}./${path.relative(
    path.dirname(selfFilePath),
    filePath
  )}`;
}

/**
 * Get corresponding source from path
 *
 * @param {string} routePath
 * @param {Array<Object>} routes
 */
function getSourceFromPath(routePath, routes) {
  for (const route of routes) {
    if (route.path === routePath) {
      return route.source;
    }
  }
  return null;
}

/**
 * 读取用户配置并合并
 * @param {object} defaultConfig
 * @param {object} passedOptions
 */
function mergeConfig(defaultConfig, passedOptions = {}) {
  // TODO: to be finished
  const {
    routes = [],
    window,
    tabBar,
    nativeCustomComponent = {},
    subpackages,
    preloadRule,
    ...appExtraConfig
  } = passedOptions;
  const router = {};
  routes.forEach(({ entryName, path }) => {
    router[entryName] = [path];
  });

  if (tabBar && tabBar.items) {
    tabBar.items.forEach(item => {
      item.pagePath = item.pagePath || getSourceFromPath(item.path, routes);
    });
  }

  const config = {
    router,
    entry: routes[0] && routes[0].path,
    generate: {
      ...defaultConfig.generate,
      tabBar,
      nativeCustomComponent
    },
    app: window,
    appExtraConfig
  };
  return Object.assign({}, defaultConfig, config);
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
  pageConfig,
  pageRoute,
  target
) {
  const rem = pageConfig && pageConfig.rem;
  const pageStyle = pageConfig && pageConfig.pageStyle;

  let pageXmlContent = `<element ${
    adapter[target].directive.if
  }="{{pageId}}" class="{{bodyClass}}" style="{{bodyStyle}}" data-private-node-id="e-body" data-private-page-id="{{pageId}}" ${
    customComponentRoot ? 'generic:custom-component="custom-component"' : ''
  }> </element>`;

  if (target === WECHAT_MINIPROGRAM && (rem || pageStyle)) {
    pageXmlContent = `<page-meta ${
      rem ? 'root-font-size="{{rootFontSize}}"' : ''
    } ${
      pageStyle ? 'page-style="{{pageStyle}}"' : ''
    }></page-meta>${pageXmlContent}`;
  }
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
  pageConfig,
  pageExtraConfig,
  customComponentRoot,
  assetPathPrefix,
  pageRoute,
  target
) {
  const pullDownRefresh = pageConfig && pageConfig.pullDownRefresh;
  const reachBottom = pageConfig && pageConfig.reachBottom;
  const reachBottomDistance = pageConfig && pageConfig.reachBottomDistance;

  const pageJson = {
    ...pageExtraConfig,
    enablePullDownRefresh: !!pullDownRefresh,
    usingComponents: {
      element: 'miniapp-element'
    }
  };
  if (customComponentRoot) {
    pageJson.usingComponents['custom-component'] = getAssetPath(
      assetPathPrefix,
      'custom-component/index',
      {},
      `${pageRoute}.js`
    );
  }
  if (reachBottom && typeof reachBottomDistance === 'number') {
    pageJson.onReachBottomDistance = reachBottomDistance;
  }
  const pageJsonContent = JSON.stringify(pageJson, null, '\t');
  addFile(compilation, `${pageRoute}.json`, pageJsonContent);
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

function handleAppJS(compilation, appAssets, assetsSubpackageMap, target) {
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

function handleAppCSS(
  compilation,
  appAssets,
  assetsSubpackageMap,
  appCssConfig = 'default',
  target
) {
  const cssTmpl = appCssConfig === 'display' ? appDisplayCssTmpl : appCssTmpl;
  let appCssContent = appCssConfig === 'none' ? '' : cssTmpl;
  if (appAssets.css.length) {
    appCssContent += `\n${appAssets.css
      .map(
        css =>
          `@import "${getAssetPath(
            '',
            css,
            assetsSubpackageMap,
            `app.${adapter[target].css}`
          )}";`
      )
      .join('\n')}`;
  }
  appCssContent = adjustCss(appCssContent);
  if (appCssConfig !== 'none' && appCssConfig !== 'display') {
    appCssContent += `\n${appExtraCssTmpl}`;
  }
  addFile(compilation, `app.${adapter[target].css}`, appCssContent);
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

function handleConfigJS(
  compilation,
  subpackagesMap,
  tabBarMap,
  pageConfigMap,
  customComponentConfig,
  { router, origin, entry, redirect, optimization, runtime },
  target
) {
  const processedRouter = {};
  if (router) {
    // Handle router
    Object.keys(router).forEach(key => {
      const pathObjList = [];
      let pathList = router[key];
      pathList = Array.isArray(pathList) ? pathList : [pathList];

      for (const pathItem of pathList) {
        if (pathItem && typeof pathItem === 'string') {
          const keys = [];
          const regexp = pathToRegexp(pathItem, keys);
          const pattern = regexp.valueOf();

          pathObjList.push({
            regexp: pattern.source,
            options: `${pattern.global ? '' : ''}${
              pattern.ignoreCase ? 'i' : ''
            }${pattern.multiline ? 'm' : ''}`
          });
        }
      }
      processedRouter[key] = pathObjList;
    });
  }
  const configJsContent = `module.exports = ${JSON.stringify(
    {
      target,
      origin: origin || 'https://miniapp.default',
      entry: entry || '/',
      router: processedRouter,
      runtime: Object.assign(
        {
          subpackagesMap,
          tabBarMap,
          usingComponents: customComponentConfig.usingComponents || {}
        },
        runtime || {}
      ),
      pages: pageConfigMap,
      redirect: redirect || {},
      optimization: optimization || {}
    },
    null,
    '\t'
  )}`;
  addFile(compilation, 'config.js', configJsContent);
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
      path.resolve(outputPath, 'custom-component/components')
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
  autoBuildNpm = true,
  stats,
  target,
  customComponentConfig = {},
  callback
) {
  if (!autoBuildNpm) return callback();

  const sourcePath = path.join(process.cwd(), 'src');
  const customComponentRoot =
    customComponentConfig.root &&
    path.resolve(sourcePath, customComponentConfig.root);

  const outputPath = path.resolve(stats.compilation.outputOptions.path);

  const build = () => {
    const outputNpmPath = path.resolve(outputPath, adapter[target].npmDirName);
    ensureDirSync(outputNpmPath);

    ['miniapp-element', 'miniapp-render'].forEach(name => {
      const sourceNpmFileDir = path.resolve(
        process.cwd(),
        'node_modules',
        name,
        'dist',
        adapter[target].fileName
      );
      const distNpmFileDir = path.resolve(
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
        const elementJSONFilePath = path.resolve(distNpmFileDir, 'index.json');
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
  globalVars = [],
  afterOptimizations,
  pluginName
) {
  if (afterOptimizations) {
    compilation.hooks.afterOptimizeChunkAssets.tap(pluginName, chunks => {
      wrapChunks(compilation, chunks, globalVars);
    });
  } else {
    compilation.hooks.optimizeChunkAssets.tapAsync(
      pluginName,
      (chunks, callback) => {
        wrapChunks(compilation, chunks, globalVars);
        callback();
      }
    );
  }
}

class MiniAppRuntimePlugin {
  constructor(passedOptions) {
    this.options = mergeConfig(defaultConfig, passedOptions);
    this.target = passedOptions.target || MINIAPP;
  }

  apply(compiler) {
    const options = this.options;
    const target = this.target;
    const generateConfig = options.generate || {};

    compiler.hooks.emit.tapAsync(PluginName, (compilation, callback) => {
      const outputPath = compilation.outputOptions.path;
      const sourcePath = path.join(process.cwd(), 'src');
      const entryNames = Array.from(compilation.entrypoints.keys());
      const appJsEntryName = generateConfig.app || 'default';
      const globalConfig = options.global || {};
      const pageConfigMap = options.pages || {};
      const subpackagesConfig = generateConfig.subpackages || {};
      const customComponentConfig = generateConfig.nativeCustomComponent || {};
      const customComponentRoot =
        customComponentConfig.root &&
        path.resolve(sourcePath, customComponentConfig.root);
      const customComponents = customComponentConfig.usingComponents || {};
      const pages = [];
      const subpackagesMap = {}; // page - subpackage
      const assetsMap = {}; // page - asset
      const assetsReverseMap = {}; // asset - page
      const assetsSubpackageMap = {}; // asset - subpackage
      const tabBarMap = {};

      // Collect asset
      for (const entryName of entryNames) {
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

        assetsMap[entryName] = assets;
      }

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
      const appJsEntryIndex = entryNames.indexOf(appJsEntryName);
      if (appJsEntryIndex >= 0) entryNames.splice(appJsEntryIndex, 1);

      // Handle custom component
      Object.keys(customComponents).forEach(key => {
        if (typeof customComponents[key] === 'string') {
          customComponents[key] = {
            path: customComponents[key]
          };
        }
      });

      // Handle each entry page
      for (const entryName of entryNames) {
        const assets = assetsMap[entryName];
        pageConfigMap[entryName] = Object.assign(
          {},
          globalConfig,
          pageConfigMap[entryName] || {}
        );
        const pageConfig = pageConfigMap[entryName];
        const pageExtraConfig = pageConfig && pageConfig.extra || {};
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
          pageConfig,
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
          pageExtraConfig,
          customComponentRoot,
          assetPathPrefix,
          pageRoute,
          target
        );

        // Record page path
        if (!packageName) pages.push(pageRoute);
      }

      // Add webview page
      handleWebview(compilation, pages, options, target);

      const isEmitApp = generateConfig.app !== 'noemit';
      if (isEmitApp) {
        const appAssets = assetsMap[appJsEntryName] || { js: [], css: [] };

        // App js
        handleAppJS(compilation, appAssets, assetsSubpackageMap, target);
        // App css
        handleAppCSS(
          compilation,
          appAssets,
          assetsSubpackageMap,
          generateConfig.appWxss,
          target
        );

        // Project.config.json
        handleProjectConfig(compilation, options, target);

        // Sitemap.json
        handleSiteMap(compilation, options, target);
      }

      // Config js
      handleConfigJS(
        compilation,
        subpackagesMap,
        tabBarMap,
        pageConfigMap,
        customComponentConfig,
        options,
        target
      );

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
        generateConfig.globalVars,
        this.afterOptimizations,
        PluginName
      );
    });

    compiler.hooks.done.tapAsync(PluginName, (stats, callback) => {
      // Install dependency automatically
      const customComponentConfig = generateConfig.nativeCustomComponent || {};
      installDependencies(
        generateConfig.autoBuildNpm,
        stats,
        target,
        customComponentConfig,
        callback
      );
    });
  }
}

module.exports = MiniAppRuntimePlugin;
