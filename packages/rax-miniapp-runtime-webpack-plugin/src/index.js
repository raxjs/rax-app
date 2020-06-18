const { resolve, relative, join } = require('path');
const { readJsonSync, existsSync } = require('fs-extra');
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
  generateCustomComponent,
  generatePageCSS,
  generatePageJS,
  generatePageJSON,
  generatePageXML,
  generateRootTemplate,
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
    const { nativeLifeCycleMap, usingComponents, routes = [], command } = options;
    let isFirstRender = true;
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
      const pages = [];
      const assetsMap = {}; // page - asset
      const assetsReverseMap = {}; // asset - page
      const changedFiles = Object.keys(
        compiler.watchFileSystem.watcher.mtimes
      ).map((filePath) => {
        return filePath.replace(sourcePath, '');
      });
      const useNativeComponent = Object.keys(usingComponents).length > 0;

      // Collect asset
      routes
        .filter(({ entryName }) => {
          return isFirstRender || changedFiles.includes(entryName);
        })
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

          // xml/css/json file only need writeOnce
          if (isFirstRender) {
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

          // Record page path
          pages.push(entryName);
        });

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

      // These files only need write when first render
      if (isFirstRender) {
        // render.js
        generateRender(compilation, { target, command, rootDir });

        // Config js
        generateConfig(compilation, usingComponents, {
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

        if (target !== MINIAPP) {
          // Generate root template xml
          generateRootTemplate(compilation, {
            target,
            command,
            rootDir,
          });
          // Generate self loop element
          generateElementJS(compilation, {
            target,
            command,
            rootDir,
          });
          generateElementJSON(compilation, {
            target,
            command,
            rootDir,
          });
          generateElementTemplate(compilation, {
            target,
            command,
            rootDir,
          });
        } else if (!useNativeComponent) {
          // Only when there isn't native component, it need generate root template file
          // Generate root template xml
          generateRootTemplate(compilation, {
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
