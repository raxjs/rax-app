const { resolve, relative, join, dirname } = require('path');
const { readJsonSync, existsSync, copyFileSync, lstatSync, ensureDirSync } = require('fs-extra');
const { MINIAPP, VENDOR_CSS_FILE_NAME } = require('./constants');
const adapter = require('./adapter');
const isCSSFile = require('./utils/isCSSFile');
const wrapChunks = require('./utils/wrapChunks');
const {
  generateAppCSS,
  generateAppJS,
  generateConfig,
  generateCustomComponent,
  generatePageCSS,
  generatePageJS,
  generatePageJSON,
  generatePageXML,
  generateRootTmpl,
  generateElementJS,
  generateElementJSON,
  generateElementTemplate,
  generateRender,
  generatePkg
} = require('./generators');

const PluginName = 'MiniAppRuntimePlugin';

class MiniAppRuntimePlugin {
  constructor(options) {
    this.options = options;
    this.target = options.target || MINIAPP;
  }

  apply(compiler) {
    const rootDir = __dirname;
    const options = this.options;
    const target = this.target;
    const { nativeLifeCycleMap, usingComponents, routes = [], command } = options;
    let isFirstRender = true;
    let lastUseNativeComponentCount = 0; // Record native component used count last time
    // Execute when compilation created
    compiler.hooks.compilation.tap(PluginName, (compilation) => {
      // Optimize chunk assets
      compilation.hooks.optimizeChunkAssets.tapAsync(
        PluginName,
        (chunks, callback) => {
          wrapChunks(compilation, chunks, target);
          callback();
        }
      );
    });

    compiler.hooks.emit.tapAsync(PluginName, (compilation, callback) => {
      const outputPath = join(compilation.outputOptions.path, target);
      const sourcePath = join(options.rootDir, 'src');
      const pages = [];
      const changedFiles = Object.keys(
        compiler.watchFileSystem.watcher.mtimes
      ).map((filePath) => {
        return filePath.replace(sourcePath, '');
      });
      const useNativeComponentCount = Object.keys(usingComponents).length;
      const useNativeComponent = useNativeComponentCount > 0;
      if (isFirstRender) {
        lastUseNativeComponentCount = useNativeComponentCount;
      }
      const useNativeComponentCountChanged = useNativeComponentCount !== lastUseNativeComponentCount;
      lastUseNativeComponentCount = useNativeComponentCount;
      // Collect asset
      routes
        .forEach(({ entryName }) => {
          pages.push(entryName);
          const assets = { js: [], css: [] };
          let pageConfig = {};
          const pageConfigPath = resolve(outputPath, entryName + '.json');
          if (existsSync(pageConfigPath)) {
            pageConfig = readJsonSync(pageConfigPath);
          }

          const pageRoute = join(sourcePath, entryName);
          const nativeLifeCycles =
            nativeLifeCycleMap[pageRoute] || {};
          const route = routes.find(({ source }) => source === entryName);
          if (route.window && route.window.pullRefresh) {
            nativeLifeCycles.onPullDownRefresh = true;
            // onPullIntercept only exits in wechat miniprogram
            if (target === MINIAPP) {
              nativeLifeCycles.onPullIntercept = true;
            }
          }

          // xml/css/json file need be written in first render or using native component state changes
          if (isFirstRender || useNativeComponentCountChanged) {
            // Page xml
            generatePageXML(compilation, entryName, useNativeComponent, {
              target,
              command,
              rootDir,
            });

            // Page json
            generatePageJSON(
              compilation,
              pageConfig,
              useNativeComponent,
              entryName,
              { target, command, rootDir }
            );
          }

          // Page js
          generatePageJS(
            compilation,
            assets,
            entryName,
            nativeLifeCycles,
            { target, command, rootDir }
          );
        });

      // These files need be written in first render
      if (isFirstRender) {
        // render.js
        generateRender(compilation, { target, command, rootDir });
      }

      // Collect app.js
      if (isFirstRender || changedFiles.includes('/app.js' || '/app.ts')) {
        const commonAppJSFilePaths = compilation.entrypoints
          .get('index')
          .getFiles()
          .filter((filePath) => !isCSSFile(filePath));
        // App js
        generateAppJS(compilation, commonAppJSFilePaths, {
          target,
          command,
          rootDir,
        });
      }

      if (
        isFirstRender ||
        changedFiles.some((filePath) => isCSSFile(filePath))
      ) {
        generateAppCSS(compilation, { target, command, rootDir });
      }

      // These files need be written in first render and using native component state changes
      if (isFirstRender || useNativeComponentCountChanged) {
        // Config js
        generateConfig(compilation, usingComponents, pages, {
          target,
          command,
          rootDir,
        });

        // Custom-component
        generateCustomComponent(
          compilation,
          usingComponents,
          { target, command }
        );

        // Only when developer may use native component, it will generate package.json in output
        if (useNativeComponent || existsSync(join(sourcePath, 'public'))) {
          generatePkg(compilation, {
            target,
            command,
            rootDir,
          });
        }

        if (target !== MINIAPP || useNativeComponent) {
          // Generate self loop element
          generateElementJS(compilation, {
            target,
            command,
            rootDir,
          });
          generateElementJSON(compilation, useNativeComponent, {
            target,
            command,
            rootDir,
          });
          generateElementTemplate(compilation, {
            target,
            command,
            rootDir,
          });
        } else {
          // Only when there isn't native component, it need generate root template file
          // Generate root template xml
          generateRootTmpl(compilation, {
            target,
            command,
            rootDir,
          });
        }
      }

      isFirstRender = false;
      callback();
    });
  }
}

module.exports = MiniAppRuntimePlugin;
