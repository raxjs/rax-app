const { resolve, join } = require('path');
const { readJsonSync, existsSync } = require('fs-extra');
const { MINIAPP } = require('./constants');
const isCSSFile = require('./utils/isCSSFile');
const wrapChunks = require('./utils/wrapChunks');
const {
  generateAppCSS,
  generateAppJS,
  generateConfig,
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
    const { nativeLifeCycleMap, usingComponents = {}, usingPlugins = {}, routes = [], command } = options;
    let isFirstRender = true;
    let lastUseComponentCount = 0; // Record native component and plugin component used count last time

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
      const usePluginComponentCount = Object.keys(usingPlugins).length;
      const useNativeComponentCount = Object.keys(usingComponents).length;

      let useComponentCountChanged = false;
      if (!isFirstRender) {
        useComponentCountChanged = useNativeComponentCount !== lastUseComponentCount;
      }
      lastUseComponentCount = useNativeComponentCount + usePluginComponentCount;
      const useComponent = lastUseComponentCount > 0;


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
          if (isFirstRender || useComponentCountChanged) {
            // Page xml
            generatePageXML(compilation, entryName, useComponent, {
              target,
              command,
              rootDir,
            });

            // Page json
            generatePageJSON(
              compilation,
              pageConfig,
              useComponent,
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
      if (isFirstRender || useComponentCountChanged) {
        // Config js
        generateConfig(compilation, {
          usingComponents,
          usingPlugins,
          pages,
          target,
          command,
          rootDir,
        });


        // Only when developer may use native component, it will generate package.json in output
        if (useNativeComponentCount > 0 || existsSync(join(sourcePath, 'public'))) {
          generatePkg(compilation, {
            target,
            command,
            rootDir,
          });
        }

        if (target !== MINIAPP || useComponent) {
          // Generate self loop element
          generateElementJS(compilation, {
            target,
            command,
            rootDir,
          });
          generateElementJSON(compilation, {
            usingComponents,
            usingPlugins,
            target,
            command,
            rootDir,
          });
          generateElementTemplate(compilation, {
            usingPlugins,
            usingComponents,
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
            usingPlugins,
            usingComponents,
          });
        }
      }

      isFirstRender = false;
      callback();
    });
  }
}

module.exports = MiniAppRuntimePlugin;
