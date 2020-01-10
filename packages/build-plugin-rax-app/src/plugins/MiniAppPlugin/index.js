const path = require("path");
const { readFileSync, ensureDirSync } = require("fs-extra");
const ConcatSource = require("webpack-sources").ConcatSource;
const ModuleFilenameHelpers = require("webpack/lib/ModuleFilenameHelpers");
const { RawSource } = require("webpack-sources");
const pathToRegexp = require("path-to-regexp");
const chalk = require('chalk');
const adjustCss = require("./tool/adjust-css");
const _ = require("./tool/utils");
const defaultConfig = require('./defaultConfig');
const { MINIAPP, WECHAT_MINIPROGRAM } = require('../../constants');
const adapter = require('./adapter');

const PluginName = "MpPlugin";
const appJsTmpl = readFileSync(
  path.resolve(__dirname, "./tmpl/app.tmpl.js"),
  "utf8",
);
const pageJsTmpl = readFileSync(
  path.resolve(__dirname, "./tmpl/page.tmpl.js"),
  "utf8",
);
const appDisplayCssTmpl = readFileSync(
  path.resolve(__dirname, "./tmpl/app.display.tmpl.css"),
  "utf8",
);
const appExtraCssTmpl = readFileSync(
  path.resolve(__dirname, "./tmpl/app.extra.tmpl.css"),
  "utf8",
);
const appCssTmpl = readFileSync(
  path.resolve(__dirname, "./tmpl/app.tmpl.css"),
  "utf8",
);
const customComponentJsTmpl = readFileSync(
  path.resolve(__dirname, "./tmpl/custom-component.tmpl.js"),
  "utf8",
)
const projectConfigJsonTmpl = require("./tmpl/project.config.tmpl.json");
const packageConfigJsonTmpl = require("./tmpl/package.tmpl.json");

process.env.isMiniprogram = true; // 设置环境变量
const globalVars = [
  "HTMLElement"
];

/**
 * 添加文件
 */
function addFile(compilation, filename, content, target = WECHAT_MINIPROGRAM) {
  console.log(`${target}/${filename}`);
  compilation.assets[`${target}/${filename}`] = {
    source: () => content,
    size: () => Buffer.from(content).length,
  };
}

/**
 * 给 chunk 头尾追加内容
 */
function wrapChunks(compilation, chunks, globalVarsConfig) {
  chunks.forEach(chunk => {
    chunk.files.forEach(fileName => {
      if (ModuleFilenameHelpers.matchObject({ test: /\.js$/ }, fileName)) {
        // 页面 js
        const headerContent =
          `module.exports = function(window, document) {const App = function(options) {window.appOptions = options};${
            globalVars.map(item => `var ${item} = window.${item}`).join(";")
          };`;
        let customHeaderContent = globalVarsConfig
          .map(
            item =>
              `var ${item[0]} = ${
                item[1] ? item[1] : `window['${  item[0]  }']`
              }`,
          )
          .join(";");
        customHeaderContent = customHeaderContent
          ? `${customHeaderContent  };`
          : "";
        const footerContent = "}";

        compilation.assets[fileName] = new ConcatSource(
          headerContent + customHeaderContent,
          compilation.assets[fileName],
          footerContent,
        );
      }
    });
  });
}

/**
 * 获取依赖文件路径
 */
function getAssetPath(
  assetPathPrefix,
  filePath,
  assetsSubpackageMap,
  selfFilePath,
  target = WECHAT_MINIPROGRAM
) {
  if (assetsSubpackageMap[filePath]) assetPathPrefix = ""; // 依赖在分包内，不需要补前缀
  return `${assetPathPrefix}./${path.relative(
    path.dirname(`${target}/${selfFilePath}`),
    filePath,
  )}`;
}

/**
 * 读取用户配置并合并
 * @param {object} defaultConfig
 * @param {object} passedOptions
 */
function mergeConfig(defaultConfig, passedOptions = {}) {
  // TODO: to be finished
  const { routes = [], window, tabBar, subpackages, preloadRule, ...appExtraConfig } = passedOptions;
  const router = {};
  routes.forEach(({ entryName, path }) => {
    router[entryName] = [path];
  });

  const config = {
    router,
    entry: routes[0] && routes[0].path,
    generate: {
      ...defaultConfig.generate,
      tabBar
    },
    app: window,
    appExtraConfig
  };
  return Object.assign({}, defaultConfig, config);
}

function handlePageJS(compilation,assets, assetPathPrefix, assetsSubpackageMap, pageRoute, pageConfig, target) {
  const addPageScroll = pageConfig && pageConfig.windowScroll;
  const reachBottom = pageConfig && pageConfig.reachBottom;
  const pullDownRefresh = pageConfig && pageConfig.pullDownRefresh;

  let pageJsContent = pageJsTmpl
    .replace(
      /miniapp-render/g,
      `miniapp-render/dist/${adapter[target].fileName}/index`
    )
    .replace(/APINamespace/g, adapter[target].APINamespace)
    .replace(/TARGET/g, `'${target}'`)
    .replace(/MINIAPP-RENDER/, `miniapp-render/dist/${adapter[target].abbr}`)
    .replace("/* CONFIG_PATH */", `${assetPathPrefix}../../config`)
    .replace(
      "/* INIT_FUNCTION */",
      `function init(window, document) {window.onload = null;${assets.js
        .map(
          js =>
            `require('${getAssetPath(
              assetPathPrefix,
              js,
              assetsSubpackageMap,
              `${pageRoute}.js`
            )}')(window, document)`
        )
        .join(";")}}`
    );
  const pageScrollFunction = addPageScroll ? () =>
  'onPageScroll({ scrollTop }) {if (this.window) {this.window.document.documentElement.scrollTop = scrollTop || 0;this.window.$$trigger("scroll");}},' : '';
  const reachBottomFunction = reachBottom ? () =>
  'onReachBottom() {if (this.window) {this.window.$$trigger("reachbottom");}},' : '';
  const pullDownRefreshFunction = pullDownRefresh ? () =>
  'onPullDownRefresh() {if (this.window) {this.window.$$trigger("pulldownrefresh");}},' : '';

  pageJsContent = pageJsContent
    .replace('/* PAGE_SCROLL_FUNCTION */', pageScrollFunction)
    .replace('/* REACH_BOTTOM_FUNCTION */', reachBottomFunction)
    .replace('/* PULL_DOWN_REFRESH_FUNCTION */', pullDownRefreshFunction);

  addFile(compilation, `${pageRoute}.js`, pageJsContent, target);
}

function handlePageXML (compilation, customComponentRoot, pageConfig, pageRoute, target) {
  const rem = pageConfig && pageConfig.rem;
  const pageStyle = pageConfig && pageConfig.pageStyle;

  let pageXmlContent = `<element ${adapter[target].directive.if}="{{pageId}}" class="{{bodyClass}}" style="{{bodyStyle}}" data-private-node-id="e-body" data-private-page-id="{{pageId}}" ${
    customComponentRoot
      ? 'generic:custom-component="custom-component"'
      : ''
  }></element>`;

  if (target === WECHAT_MINIPROGRAM && (rem || pageStyle)) {
    pageXmlContent =
      `<page-meta ${rem ? 'root-font-size="{{rootFontSize}}"' : ""} ${
        pageStyle ? 'page-style="{{pageStyle}}"' : ""
      }></page-meta>${  pageXmlContent}`;
  }
  addFile(compilation, `${pageRoute}.${adapter[target].xml}`, pageXmlContent, target);
}

function handlePageCSS(compilation, pageConfig, assets, assetPathPrefix, assetsSubpackageMap, pageRoute, target) {
  const pageBackgroundColor = pageConfig && (pageConfig.pageBackgroundColor || pageConfig.backgroundColor); // 兼容原有的 backgroundColor

  let pageCssContent = assets.css
  .map(
    css =>
      `@import "${getAssetPath(
        assetPathPrefix,
        css,
        assetsSubpackageMap,
        `${pageRoute}.${adapter[target].css}`,
      )}";`,
    )
  .join("\n");
  if (pageBackgroundColor)
    pageCssContent =
      `page { background-color: ${pageBackgroundColor}; }\n${
        pageCssContent}`;
  addFile(compilation, `${pageRoute}.${adapter[target].css}`, adjustCss(pageCssContent), target);
}

function handlePageJSON(compilation, pageConfig, pageExtraConfig, customComponentRoot, assetPathPrefix, pageRoute, target) {
  const pullDownRefresh = pageConfig && pageConfig.pullDownRefresh;
  const reachBottom = pageConfig && pageConfig.reachBottom;
  const reachBottomDistance = pageConfig && pageConfig.reachBottomDistance;

  const pageJson = {
    ...pageExtraConfig,
    enablePullDownRefresh: !!pullDownRefresh,
    usingComponents: {
      element: `miniapp-element/dist/${adapter[target].fileName}/index`
    }
  };
  if (customComponentRoot) {
    pageJson.usingComponents[
      'custom-component'
    ] = `${assetPathPrefix}../../custom-component/index`;
  }
  if (reachBottom && typeof reachBottomDistance === 'number') {
    pageJson.onReachBottomDistance = reachBottomDistance;
  }
  const pageJsonContent = JSON.stringify(pageJson, null, '\t');
  addFile(compilation, `${pageRoute}.json`, pageJsonContent, target);
}

function handleWebview(compilation, pages, { redirect }, target) {
  if (redirect && (redirect.notFound === 'webview' || redirect.accessDenied === 'webview')) {
    addFile(
      compilation,
      'pages/webview/index.js',
      'Page({data:{url:""},onLoad: function(query){this.setData({url:decodeURIComponent(query.url)})}})',
      target
    );
    addFile(
      compilation,
      `pages/webview/index.${adapter[target].xml}`,
      '<web-view src="{{url}}"></web-view>',
      target
    );
    addFile(compilation, `pages/webview/index.${adapter[target].css}`, '', target);
    addFile(
      compilation,
      'pages/webview/index.json',
      '{"usingComponents":{}}',
      target
    );
    pages.push('pages/webview/index');
  }
}

function handleAppJS (compilation, appAssets, assetsSubpackageMap, target) {
  const appJsContent = appJsTmpl.replace(
    '/* INIT_FUNCTION */',
    `const fakeWindow = {};const fakeDocument = {};${appAssets.js
      .map(
        js =>
          `require('${
            getAssetPath('', js, assetsSubpackageMap, '', "app.js")
          }')(fakeWindow, fakeDocument)`,
      )
      .join(';')};const appConfig = fakeWindow.appOptions || {};`,
  );
  addFile(compilation, 'app.js', appJsContent, target);
}

function handleAppCSS (compilation, appAssets, assetsSubpackageMap, appCssConfig = 'default', target) {
  const cssTmpl = appCssConfig === "display" ? appDisplayCssTmpl : appCssTmpl;
  let appCssContent =
    appCssConfig === 'none'
      ? ""
      : cssTmpl;
  if (appAssets.css.length) {
    appCssContent += `\n${appAssets.css
      .map(
        css =>
          `@import "${getAssetPath(
            '',
            css,
            assetsSubpackageMap,
            '',
            `app.${adapter[target].css}`,
          )}";`,
      )
      .join("\n")}`;
  }
  appCssContent = adjustCss(appCssContent);
  if (appCssConfig !== 'none' && appCssConfig !== 'display') {
    appCssContent += `\n${  appExtraCssTmpl}`;
  }
  addFile(compilation, `app.${adapter[target].css}`, appCssContent, target);
}

function handleAppJSON(compilation, subpackagesConfig, preloadRuleConfig, subpackagesMap, userAppJson = {},  tabBarConfig, outputPath, tabBarMap, pages, { app }, target) {
  const subpackages = [];
  const preloadRule = {};
  Object.keys(subpackagesConfig).forEach(packageName => {
    const pages = subpackagesConfig[packageName] || [];
    subpackages.push({
      name: packageName,
      root: packageName,
      pages: pages.map(entryName => `pages/${entryName}/index`),
    });
  });
  Object.keys(preloadRuleConfig).forEach(entryName => {
    const packageName = subpackagesMap[entryName];
    const pageRoute = `${
      packageName ? `${packageName  }/` : ''
    }pages/${entryName}/index`;
    preloadRule[pageRoute] = preloadRuleConfig[entryName];
  });
  const appJson = {
    pages,
    window: app || {},
    subpackages,
    preloadRule,
    ...userAppJson,
  };
  if (tabBarConfig.list && tabBarConfig.list.length) {
    const tabBar = Object.assign({}, tabBarConfig);
    tabBar.list = tabBarConfig.list.map(item => {
      const iconPathName = item.iconPath
        ? _.md5File(item.iconPath) + path.extname(item.iconPath)
        : '';
      if (iconPathName)
        _.copyFile(
          item.iconPath,
          path.resolve(outputPath, `../images/${iconPathName}`),
        );
      const selectedIconPathName = item.selectedIconPath
        ? _.md5File(item.selectedIconPath) +
          path.extname(item.selectedIconPath)
        : '';
      if (selectedIconPathName)
        _.copyFile(
          item.selectedIconPath,
          path.resolve(outputPath, `../images/${selectedIconPathName}`),
        );
      tabBarMap[`/pages/${item.pageName}/index`] = true;

      return {
        pagePath: `pages/${item.pageName}/index`,
        text: item.text,
        iconPath: iconPathName ? `./images/${iconPathName}` : '',
        selectedIconPath: selectedIconPathName
          ? `./images/${selectedIconPathName}`
          : '',
      };
    });

    if (tabBar.custom) {
      // 自定义 tabBar
      const customTabBarDir = tabBar.custom;
      tabBar.custom = true;
      _.copyDir(
        customTabBarDir,
        path.resolve(outputPath, '../custom-tab-bar'),
      );
    }

    appJson.tabBar = tabBar;
  }
  const appJsonContent = JSON.stringify(appJson, null, "\t");
  addFile(compilation, "app.json", appJsonContent, target);
}

function handleProjectConfig(compilation, { projectConfig = {} }, target) {
  if (target === WECHAT_MINIPROGRAM) {
    const userProjectConfigJson = projectConfig;
    // 这里需要深拷贝，不然数组相同引用指向一直 push
    const projectConfigJson = JSON.parse(
      JSON.stringify(projectConfigJsonTmpl),
    );
    const projectConfigJsonContent = JSON.stringify(
      _.merge(projectConfigJson, userProjectConfigJson),
      null,
      '\t',
    );
    addFile(compilation, 'project.config.json', projectConfigJsonContent, target);
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
      addFile(compilation, 'sitemap.json', sitemapConfigJsonContent, target);
    }
  }
}

function handleConfigJS(compilation, subpackagesMap, tabBarMap, pageConfigMap, customComponentConfig, { router, origin, entry, redirect, optimization, runtime }, target) {
  const processedRouter = {};
  if (router) {
    // 处理 router
    Object.keys(router).forEach(key => {
      const pathObjList = [];
      let pathList = router[key];
      pathList = Array.isArray(pathList) ? pathList : [ pathList ];

      for (const pathItem of pathList) {
        // 将每个 route 转成正则并进行序列化
        if (pathItem && typeof pathItem === 'string') {
          const keys = [];
          const regexp = pathToRegexp(pathItem, keys);
          const pattern = regexp.valueOf();

          pathObjList.push({
            regexp: pattern.source,
            options: `${pattern.global ? '' : ''}${
              pattern.ignoreCase ? 'i' : ''
            }${pattern.multiline ? 'm' : ''}`,
          });
        }
      }
      processedRouter[key] = pathObjList;
    });
  }
  const configJsContent =
    `module.exports = ${
      JSON.stringify(
        {
          target,
          origin: origin || 'https://miniapp.default',
          entry: entry || '/',
          router: processedRouter,
          runtime: Object.assign(
            {
              subpackagesMap,
              tabBarMap,
              usingComponents: customComponentConfig.usingComponents || {},
            },
            runtime || {},
          ),
          pages: pageConfigMap,
          redirect: redirect || {},
          optimization: optimization || {},
        },
        null,
        '\t',
      )}`;
  addFile(compilation, 'config.js', configJsContent, target);
}

function handlePackageJSON(compilation, userPackageConfigJson = {}, target) {
  const packageConfigJson = Object.assign({}, packageConfigJsonTmpl);
  const packageConfigJsonContent = JSON.stringify(
    _.merge(packageConfigJson, userPackageConfigJson),
    null,
    '\t'
  );
  addFile(compilation, 'package.json', packageConfigJsonContent, target);
}

function handleCustomComponent(compilation, customComponentRoot, customComponents, outputPath, target) {
  // 自定义组件，生成到 miniprogram_npm 中
  if (customComponentRoot) {
    _.copyDir(
      customComponentRoot,
      path.resolve(outputPath, '../custom-component/components'),
    );

    const realUsingComponents = {};
    const names = Object.keys(customComponents);
    names.forEach(
      key =>
        (realUsingComponents[
          key
        ] = `components/${customComponents[key].path}`),
    );

    const customComponentJsContent = customComponentJsTmpl
      .replace(/MINIAPP-RENDER/, `miniapp-render/dist/${adapter[target].abbr}`)


    // custom-component/index.js
    addFile(
      compilation,
      "custom-component/index.js",
      customComponentJsTmpl.replace(
        /miniapp-render/g,
        `miniapp-render/dist/${adapter[target].fileName}/index`
      ),
      target
    );

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
            .map(name => `${name  }="{{${  name  }}}"`)
            .join(" ")} ${events
            .map(name => `bind${  name  }="on${  name  }"`)
            .join(" ")}><slot/></${key}>`;
        })
        .join('\n'),
      target
    );

    // custom-component/index.css
    addFile(compilation, `custom-component/index.${adapter[target].css}`, '', target);

    // custom-component/index.json
    addFile(
      compilation,
      'custom-component/index.json',
      JSON.stringify(
        {
          component: true,
          usingComponents: realUsingComponents,
        },
        null,
        '\t',
      ),
      target
    );
  }
}

function handleNodeModules(compilation, target) {
  addFile(compilation, 'node_modules/.miniprogram', '', target);
}

function installDependencies(autoBuildNpm = false, stats, target, callback) {
  if (!autoBuildNpm) return callback();

  const outputPath = path.resolve(
    stats.compilation.outputOptions.path,
    target,
  );

  let callbackExecuted = false;

  const build = () => {
    const outputNpmPath = path.resolve(outputPath, adapter[target].npmDirName);
    ensureDirSync(outputNpmPath);
    ['miniapp-element', 'miniapp-render'].forEach(name => {
      _.copyDir(
        path.resolve(process.cwd(), "node_modules", name),
        path.resolve(outputPath, adapter[target].npmDirName, name)
      );
    });
    if (!callbackExecuted) {
      callback();
    }
  };
  console.log(chalk.green(`Start building deps for ${adapter[target].name}...`));

  build();

  callback();
  callbackExecuted = true;
}

function handleWrapChunks(compilation, globalVars = [], afterOptimizations, pluginName) {
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
      },
    );
  }
}

class MpPlugin {
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
      const entryNames = Array.from(compilation.entrypoints.keys());
      const appJsEntryName = generateConfig.app || 'default';
      const globalConfig = options.global || {};
      const pageConfigMap = options.pages || {};
      const subpackagesConfig = generateConfig.subpackages || {};
      const preloadRuleConfig = generateConfig.preloadRule || {};
      const tabBarConfig = generateConfig.tabBar || {};
      const customComponentConfig = generateConfig.wxCustomComponent || {};
      const customComponentRoot = customComponentConfig.root;
      const customComponents = customComponentConfig.usingComponents || {};
      const pages = [];
      const subpackagesMap = {}; // 页面名-分包名
      const assetsMap = {}; // 页面名-依赖
      const assetsReverseMap = {}; // 依赖-页面名
      const assetsSubpackageMap = {}; // 依赖-分包名
      const tabBarMap = {};

      // 收集依赖
      for (const entryName of entryNames) {
        const assets = { js: [], css: [] };
        const filePathMap = {};
        const extRegex = /\.(css|js|wxss|acss)(\?|$)/;
        const entryFiles = compilation.entrypoints.get(entryName).getFiles();
        entryFiles.forEach(filePath => {
          // 跳过非 css 和 js
          const extMatch = extRegex.exec(filePath);
          if (!extMatch) return;

          // 跳过已记录的
          if (filePathMap[filePath]) return;
          filePathMap[filePath] = true;

          // 记录
          let ext = extMatch[1];
          ext = (ext === 'wxss' || ext === 'css' || ext === 'acss') ? 'css' : ext;
          assets[ext].push(filePath);

          // 插入反查表
          assetsReverseMap[filePath] = assetsReverseMap[filePath] || [];
          if (assetsReverseMap[filePath].indexOf(entryName) === -1)
            assetsReverseMap[filePath].push(entryName);

          // 调整 css 内容
          if (ext === 'css') {
            compilation.assets[filePath] = new RawSource(
              adjustCss(compilation.assets[filePath].source()),
            );
          }
        });

        assetsMap[entryName] = assets;
      }

      // 处理分包配置
      Object.keys(subpackagesConfig).forEach(packageName => {
        const pages = subpackagesConfig[packageName] || [];
        pages.forEach(entryName => {
          subpackagesMap[entryName] = packageName;

          // 寻找私有依赖，放入分包
          const assets = assetsMap[entryName];
          if (assets) {
            [...assets.js, ...assets.css].forEach(filePath => {
              const requirePages = assetsReverseMap[filePath] || [];
              if (_.includes(pages, requirePages)) {
                // 该依赖为分包内页面私有
                assetsSubpackageMap[filePath] = packageName;
                compilation.assets[`../${packageName}/common/${filePath}`] =
                  compilation.assets[filePath];
                delete compilation.assets[filePath];
              }
            });
          }
        });
      });

      // 剔除 app.js 入口
      const appJsEntryIndex = entryNames.indexOf(appJsEntryName);
      if (appJsEntryIndex >= 0) entryNames.splice(appJsEntryIndex, 1);

      // 处理自定义组件字段
      Object.keys(customComponents).forEach(key => {
        if (typeof customComponents[key] === 'string') {
          customComponents[key] = {
            path: customComponents[key],
          };
        }
      });

      // 处理各个入口页面
      for (const entryName of entryNames) {
        const assets = assetsMap[entryName];
        pageConfigMap[entryName] = Object.assign(
          {},
          globalConfig,
          pageConfigMap[entryName] || {},
        );
        const pageConfig = pageConfigMap[entryName];
        const pageExtraConfig = (pageConfig && pageConfig.extra) || {};
        const packageName = subpackagesMap[entryName];
        const pageRoute = `${
          packageName ? `${packageName  }/` : ''
        }pages/${entryName}/index`;
        const assetPathPrefix = packageName ? '../' : '';

        // 页面 js
        handlePageJS(compilation, assets, assetPathPrefix, assetsSubpackageMap, pageRoute, pageConfig, target);

        // 页面 xml
        handlePageXML(compilation, customComponentRoot, pageConfig, pageRoute, target);

        // 页面 css
        handlePageCSS(compilation, pageConfig, assets, assetPathPrefix, assetsSubpackageMap, pageRoute, target);

        // 页面 json
        handlePageJSON(compilation, pageConfig, pageExtraConfig, customComponentRoot, assetPathPrefix, pageRoute, target);

        // 记录页面路径
        if (!packageName) pages.push(pageRoute);
      }

      // 追加 webview 页面
      handleWebview(compilation, pages, options, target);

      const isEmitApp = generateConfig.app !== 'noemit';
      if (isEmitApp) {
        const appAssets = assetsMap[appJsEntryName] || { js: [], css: [] };

        // app js
        handleAppJS(compilation, appAssets, assetsSubpackageMap, target);
        // app css
        handleAppCSS(compilation, appAssets, assetsSubpackageMap, generateConfig.appWxss, target);

        // app json
        handleAppJSON(compilation, subpackagesConfig, preloadRuleConfig, subpackagesMap, options.appExtraConfig, tabBarConfig, outputPath, tabBarMap, pages, options, target);

        // project.config.json
        handleProjectConfig(compilation, options, target);

        // sitemap.json
        handleSiteMap(compilation, options, target);
      }

      // config js
      handleConfigJS(compilation, subpackagesMap, tabBarMap, pageConfigMap, customComponentConfig, options, target);

      // package.json
      handlePackageJSON(compilation, options.packageConfig, target);

      // node_modules
      handleNodeModules(compilation, target);

      // custom-component
      handleCustomComponent(compilation, customComponentRoot, customComponents, outputPath, target);

      callback();
    });

    compiler.hooks.compilation.tap(PluginName, compilation => {
      // 处理头尾追加内容
      handleWrapChunks(compilation, generateConfig.globalVars, this.afterOptimizations, PluginName);
    });

    compiler.hooks.done.tapAsync(PluginName, (stats, callback) => {
      // 处理自动安装小程序依赖
      installDependencies(generateConfig.autoBuildNpm, stats, target, callback);
    });
  }
}

module.exports = MpPlugin;
