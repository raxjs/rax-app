const { resolve, relative, join, dirname } = require('path');
const { readJsonSync, existsSync, copyFileSync, lstatSync, ensureDirSync } = require('fs-extra');
const { RawSource } = require('webpack-sources');
const adjustCSS = require('./utils/adjustCSS');
const { MINIAPP, VENDOR_CSS_FILE_NAME } = require('./constants');
const adapter = require('./adapter');
const isCSSFile = require('./utils/isCSSFile');
const wrapChunks = require('./utils/wrapChunks');
const {
  generateAppCSS,
  generateAppJS,
  generateConfig,
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
const extRegex = /\.(css|js|wxss|acss)(\?|$)/;

class MiniAppRuntimePlugin {
  constructor(options) {
    this.options = options;
    this.target = options.target || MINIAPP;
  }

  apply(compiler) {
    const rootDir = __dirname;
    const options = this.options;
    const target = this.target;
    const { nativeLifeCycleMap, usingComponents, usingPlugins, routes = [], command } = options;
    let isFirstRender = true;
    let lastUseComponentCount = 0; // Record native component and plugin component used count last time

    // Execute when compilation created
    compiler.hooks.compilation.tap(PluginName, (compilation) => {
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
      const assetsMap = {}; // page - asset
      const assetsReverseMap = {}; // asset - page
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
          const assets = { js: [], css: [] };
          const filePathMap = {};
          const entryFiles = compilation.entrypoints.get(entryName).getFiles();
          entryFiles.forEach((filePath) => {
            // Skip non css or js
            const extMatch = extRegex.exec(filePath);
            if (!extMatch) return;

            const ext = isCSSFile(filePath) ? 'css' : extMatch[1];

            let relativeFilePath;
            // Adjust css content
            if (ext === 'css') {
              relativeFilePath = filePath;
              if (relativeFilePath !== `${target}/${VENDOR_CSS_FILE_NAME}`) {
                compilation.assets[
                  `${relativeFilePath}.${adapter[target].css}`
                ] = new RawSource(
                  adjustCSS(compilation.assets[relativeFilePath].source())
                );
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
            assetsReverseMap[relativeFilePath] =
              assetsReverseMap[relativeFilePath] || [];
            if (assetsReverseMap[relativeFilePath].indexOf(entryName) === -1)
              assetsReverseMap[relativeFilePath].push(entryName);
          });

          assetsMap[entryName] = assets;
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

            // Page css
            generatePageCSS(compilation, assets, entryName, {
              target,
              command,
              rootDir,
            });
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
          .get('app')
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
