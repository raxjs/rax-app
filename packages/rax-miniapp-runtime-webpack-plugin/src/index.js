const { resolve, relative, join, dirname } = require('path');
const {
  readFileSync,
  readJsonSync,
  writeJsonSync,
  copySync,
  copy,
  existsSync
} = require('fs-extra');
const ConcatSource = require('webpack-sources').ConcatSource;
const ModuleFilenameHelpers = require('webpack/lib/ModuleFilenameHelpers');
const { RawSource } = require('webpack-sources');
const chalk = require('chalk');
const adjustCss = require('./tool/adjust-css');
const includes = require('./tool/includes');
const { MINIAPP, WECHAT_MINIPROGRAM } = require('./constants');
const adapter = require('./adapter');

const PluginName = 'MiniAppRuntimePlugin';
const extRegex = /\.(css|js|wxss|acss)(\?|$)/;
const vendorCSSFileName = 'vendor.css';

const appJsTmpl = readFileSync(
  resolve(__dirname, 'templates', 'app.js'),
  'utf8'
);

const appCssTmpl = readFileSync(
  resolve(__dirname, 'templates', 'app.css'),
  'utf8'
);
const customComponentJsTmpl = readFileSync(
  resolve(__dirname, 'templates', 'custom-component.js'),
  'utf8'
);

function isCSSFile(filePath) {
  const extMatch = extRegex.exec(filePath);
  return extMatch && ['wxss', 'acss', 'css'].includes(extMatch[1]);
}

/**
 * Add file to compilation
 */
function addFile(compilation, filename, content, target) {
  compilation.assets[`${target}/${filename}`] = {
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
        const headerContent = 'module.exports = function(window, document) {const App = function(options) {window.appOptions = options};var HTMLElement = window["HTMLElement"];';

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
  )}`.replace(/\\/g, '/'); // Avoid path error in Windows
}

function getPageTmpl(target) {
  if (target === MINIAPP) {
    return readFileSync(
      resolve(__dirname, 'templates', 'ali-miniapp', 'page.js'),
      'utf8'
    );
  } else if (target === WECHAT_MINIPROGRAM) {
    return readFileSync(
      resolve(__dirname, 'templates', 'wechat-miniprogram', 'page.js'),
      'utf8'
    );
  }
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
  const pullDownRefresh = pageConfig && (pageConfig.pullDownRefresh || pageConfig.pullRefresh);
  let pageJsContent = getPageTmpl(target)
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
  const pullDownRefreshFunction = pullDownRefresh
    ? () => {
      if (target === MINIAPP) {
        return `
        onPullDownRefresh() {if (this.window) {this.window.$$trigger("onPullDownRefresh");}},
        onPullIntercept() {if (this.window) {this.window.$$trigger("onPullIntercept");}},
        `;
      } else {
        return 'onPullDownRefresh() {if (this.window) {this.window.$$trigger("onPullDownRefresh");}},';
      }
    }
    : '';

  pageJsContent = pageJsContent
    .replace('/* PULL_DOWN_REFRESH_FUNCTION */', pullDownRefreshFunction);

  addFile(compilation, `${pageRoute}.js`, pageJsContent, target);
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

  addFile(compilation, `${pageRoute}.${adapter[target].xml}`, pageXmlContent, target);
}

function handlePageCSS(
  compilation,
  assets,
  assetPathPrefix,
  assetsSubpackageMap,
  pageRoute,
  target
) {
  const pageCssContent = assets.css
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

  addFile(
    compilation,
    `${pageRoute}.${adapter[target].css}`,
    adjustCss(pageCssContent),
    target
  );
}

function handlePageJSON(
  compilation,
  pageExtraConfig,
  customComponentRoot,
  assetPathPrefix,
  pageRoute,
  target
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
  addFile(compilation, `${pageRoute}.json`, JSON.stringify(pageConfig, null, 2), target);
}

function handleAppJS(compilation, commonAppJSFilePaths, assetsSubpackageMap, target) {
  const appJsContent = appJsTmpl.replace(
    '/* INIT_FUNCTION */',
    `function init(window) {${commonAppJSFilePaths
      .map(
        filePath =>
          `require('${getAssetPath(
            '',
            relative(target, filePath),
            assetsSubpackageMap,
            'app.js'
          )}')(window)`
      )
      .join(';')}}`
  );
  addFile(compilation, 'app.js', appJsContent, target);
}

function handleAppCSS(compilation, target) {
  let appCssContent = adjustCss(appCssTmpl);
  // If inlineStyle is set to false, css file will be extracted to app.css
  const extractedAppCSSFilePath = `${target}/${vendorCSSFileName}`;
  if (compilation.assets[extractedAppCSSFilePath]) {
    compilation.assets[`${extractedAppCSSFilePath}.${adapter[target].css}`] = new RawSource(adjustCss(compilation.assets[extractedAppCSSFilePath].source()));
    delete compilation.assets[extractedAppCSSFilePath];
    appCssContent = `@import "./${vendorCSSFileName}";\n${appCssContent}`;
  }
  addFile(compilation, `app.${adapter[target].css}`, appCssContent, target);
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

function handleConfigJS(compilation, options = {}, target) {
  const exportedConfig = {
    optimization: options.optimization || {},
    nativeCustomComponent: options.config ? options.config.nativeCustomComponent ? options.config.nativeCustomComponent : undefined : undefined
  };
  addFile(compilation, 'config.js', `module.exports = ${JSON.stringify(
    exportedConfig
  )}`, target);
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
    addFile(compilation, 'custom-component/index.js', customComponentJsTmpl, target);

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
          usingComponents: realUsingComponents
        },
        null,
        '\t'
      ),
      target
    );
  }
}

function installDependencies(
  stats,
  target,
  customComponentConfig = {},
  isFirstRender,
  callback
) {
  const sourcePath = join(process.cwd(), 'src');
  const customComponentRoot =
  customComponentConfig.root &&
  resolve(sourcePath, customComponentConfig.root);

  const outputPath = resolve(stats.compilation.outputOptions.path);
  const distNpmDir = resolve(outputPath, target, adapter[target].npmDirName);

  const build = () => {
    ['miniapp-element', 'miniapp-render'].forEach(name => {
      const sourceNpmFileDir = resolve(
        process.cwd(),
        'node_modules',
        name,
        'dist',
        adapter[target].fileName
      );
      const distNpmFileDir = resolve(distNpmDir, name);
      copySync(sourceNpmFileDir, distNpmFileDir);
      // Handle custom-component path in alibaba miniapp
      if (
        target === MINIAPP &&
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


  if (isFirstRender) {
    console.log(
      chalk.green(`Start building deps for ${adapter[target].name}...`)
    );
    build();
  }

  callback();
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
    let isFirstRender = true;

    // Execute when compilation created
    compiler.hooks.compilation.tap(PluginName, compilation => {
      // Optimize chunk assets
      compilation.hooks.optimizeChunkAssets.tapAsync(
        PluginName,
        (chunks, callback) => {
          wrapChunks(compilation, chunks);
          callback();
        }
      );
    });

    compiler.hooks.emit.tapAsync(PluginName, (compilation, callback) => {
      const outputPath = join(compilation.outputOptions.path, target);
      const sourcePath = join(options.rootDir, 'src');
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
      const changedFiles = Object.keys(compiler.watchFileSystem.watcher.mtimes)
        .map(filePath => {
          return filePath.replace(sourcePath, '');
        });

      // Collect asset
      routes.filter(({ entryName }) => {
        const packageName = subpackagesMap[entryName];
        const pageRoute = `${packageName ? `${packageName}/` : ''}${entryName}`;
        return isFirstRender || changedFiles.includes(pageRoute);
      }).forEach(({ entryName }) => {
        const assets = { js: [], css: [] };
        const filePathMap = {};
        const entryFiles = compilation.entrypoints.get(entryName).getFiles();
        entryFiles.forEach(filePath => {
          // Skip non css or js
          const extMatch = extRegex.exec(filePath);
          if (!extMatch) return;

          const ext = isCSSFile(filePath) ? 'css' : extMatch[1];

          let relativeFilePath;
          // Adjust css content
          if (ext === 'css') {
            relativeFilePath = filePath;
            if (relativeFilePath !== `${target}/${vendorCSSFileName}`) {
              compilation.assets[
                `${relativeFilePath}.${adapter[target].css}`
              ] = new RawSource(adjustCss(compilation.assets[relativeFilePath].source()));
              delete compilation.assets[`${relativeFilePath}`];
            }
          }
          relativeFilePath = relative(target, filePath);

          // Skip recorded
          if (filePathMap[relativeFilePath]) return;
          filePathMap[relativeFilePath] = true;

          // Record
          assets[ext].push(relativeFilePath);

          // Insert into assetsReverseMap
          assetsReverseMap[relativeFilePath] = assetsReverseMap[relativeFilePath] || [];
          if (assetsReverseMap[relativeFilePath].indexOf(entryName) === -1)
            assetsReverseMap[relativeFilePath].push(entryName);
        });

        assetsMap[entryName] = assets;
        let pageConfig = {};
        const pageConfigPath = resolve(outputPath, entryName + '.json');
        if (existsSync(pageConfigPath)) {
          pageConfig = readJsonSync(pageConfigPath);
        }
        const packageName = subpackagesMap[entryName];
        const pageRoute = `${packageName ? `${packageName}/` : ''}${entryName}`;
        const assetPathPrefix = packageName ? '../' : '';

        // xml/css/json file only need writeOnce
        if (isFirstRender) {
          // Page xml
          handlePageXML(
            compilation,
            customComponentRoot,
            pageRoute,
            target
          );

          // Page json
          handlePageJSON(
            compilation,
            pageConfig,
            customComponentRoot,
            assetPathPrefix,
            pageRoute,
            target
          );

          // Page css
          handlePageCSS(
            compilation,
            assets,
            assetPathPrefix,
            assetsSubpackageMap,
            pageRoute,
            target
          );
        }

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

      // Handle custom component
      Object.keys(customComponents).forEach(key => {
        if (typeof customComponents[key] === 'string') {
          customComponents[key] = {
            path: customComponents[key]
          };
        }
      });

      // Collect app.js
      if (isFirstRender || changedFiles.includes('/app.js' || '/app.ts')) {
        const commonAppJSFilePaths = compilation.entrypoints.get('app').getFiles().filter(filePath => !isCSSFile(filePath));
        // App js
        handleAppJS(compilation, commonAppJSFilePaths, assetsSubpackageMap, target);
      }

      if (isFirstRender || changedFiles.some(filePath => isCSSFile(filePath))) {
        handleAppCSS(compilation, target);
      }

      // These files only need write when first render
      if (isFirstRender) {
        // Sitemap.json
        handleSiteMap(compilation, options, target);

        // Config js
        handleConfigJS(compilation, options || {}, target);
      }

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

    compiler.hooks.done.tapAsync(PluginName, (stats, callback) => {
      // Install dependency automatically
      const customComponentConfig = config.nativeCustomComponent || {};
      installDependencies(
        stats,
        target,
        customComponentConfig,
        isFirstRender,
        callback
      );
      isFirstRender = false;
    });
  }
}

module.exports = MiniAppRuntimePlugin;
