const path = require('path');
const fs = require('fs-extra');
const { constants: { MINIAPP, WECHAT_MINIPROGRAM, BYTEDANCE_MICROAPP, BAIDU_SMARTPROGRAM, KUAISHOU_MINIPROGRAM }, platformMap } = require('miniapp-builder-shared');
const { setConfig } = require('miniapp-runtime-config');
const {
  setAppConfig: setAppCompileConfig,
  setComponentConfig: setComponentCompileConfig,
} = require('miniapp-compile-config');
const { normalizeStaticConfig } = require('miniapp-builder-shared');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const { setWebviewConfig, setWebviewPageConfig } = require('miniapp-webview-config');

const separateRoutes = require('./separateRoutes').default;
const setEntry = require('./setEntry');
const { GET_RAX_APP_WEBPACK_CONFIG, MINIAPP_COMPILED_DIR, MINIAPP_BUILD_TYPES } = require('./constants');
const { copyRemoteDist } = require('./copyRemoteDist');

module.exports = (api) => {
  const { getValue, context, registerTask, onGetWebpackConfig, onHook } = api;
  const { userConfig, rootDir } = context;
  const { targets, inlineStyle, vendor, outputDir = 'build' } = userConfig;

  const miniappStandardList = [
    MINIAPP,
    WECHAT_MINIPROGRAM,
    BYTEDANCE_MICROAPP,
    BAIDU_SMARTPROGRAM,
    KUAISHOU_MINIPROGRAM,
  ];

  const getWebpackBase = getValue(GET_RAX_APP_WEBPACK_CONFIG);
  const mixTargets = [];

  onHook('after.build.compile', () => {
    copyRemoteDist(mixTargets, path.resolve(rootDir, outputDir));
  });
  onHook('after.start.compile', () => {
    copyRemoteDist(mixTargets, path.resolve(rootDir, outputDir));
  });

  targets.forEach((target) => {
    if (miniappStandardList.includes(target)) {
      const chainConfig = getWebpackBase(api, {
        target,
        babelConfigOptions: { styleSheet: inlineStyle, disableRegenerator: true },
        progressOptions: {
          name: platformMap[target].name,
        },
      });
      chainConfig.name(target);
      chainConfig.taskName = target;

      // Register task
      registerTask(target, chainConfig);

      // Get output dir
      const outputPath = path.resolve(rootDir, outputDir, target);

      // static config
      const staticConfig = normalizeStaticConfig(getValue('staticConfig'), { rootDir });
      const { normalRoutes, nativeRoutes, remoteRoutes } = separateRoutes(staticConfig.routes, { target, rootDir });

      const buildType = userConfig[target] && userConfig[target].buildType ? userConfig[target].buildType : MINIAPP_BUILD_TYPES.RUNTIME;
      if (remoteRoutes.length > 0 && buildType !== MINIAPP_BUILD_TYPES.WEBVIEW) {
        mixTargets.push(target);
        const webviewTaskName = `webview-${target}`;
        const webviewPagesChainConfig = getWebpackBase(api, {
          target: webviewTaskName,
          babelConfigOptions: { styleSheet: inlineStyle, disableRegenerator: true },
        });
        webviewPagesChainConfig.plugins.delete('ProgressPlugin');
        webviewPagesChainConfig.name(webviewTaskName);
        webviewPagesChainConfig.taskName = webviewTaskName;
        setWebviewPageConfig(
          webviewPagesChainConfig,
          {
            api,
            target,
            outputPath: path.resolve(rootDir, outputDir, 'webview', target),
          },
          remoteRoutes,
        );
        registerTask(webviewTaskName, webviewPagesChainConfig);
      }

      onGetWebpackConfig(target, (config) => {
        // Set Entry when it's runtime project
        if (buildType === MINIAPP_BUILD_TYPES.RUNTIME) {
          setEntry(chainConfig, { context, target, routes: normalRoutes });
        }
        const needCopyDirs = [];

        // Copy miniapp-native dir
        needCopyDirs.push({
          from: '**/miniapp-native/**',
          to: path.resolve(rootDir, outputDir, target),
          context: path.resolve(rootDir, 'src'),
        });

        // Copy public dir
        if (config.plugins.has('CopyWebpackPlugin')) {
          config.plugin('CopyWebpackPlugin').tap(([copyList]) => {
            return [copyList.concat(needCopyDirs)];
          });
        } else if (needCopyDirs.length > 0) {
          config.plugin('CopyWebpackPlugin').use(CopyWebpackPlugin, [needCopyDirs]);
        }

        if (buildType === MINIAPP_BUILD_TYPES.WEBVIEW) {
          setWebviewConfig(config, {
            api,
            target,
          });
          return;
        }

        if (buildType === MINIAPP_BUILD_TYPES.COMPILE) {
          setAppCompileConfig(config, userConfig[target] || {}, {
            target,
            context,
            outputPath,
            entryPath: './src/app',
            staticConfig: {
              ...staticConfig,
              routes: normalRoutes,
            },
            nativeRoutes,
          });
        } else if (buildType === MINIAPP_BUILD_TYPES.RUNTIME) {
          const { subPackages, disableCopyNpm = true } = userConfig[target] || {};
          if (vendor && subPackages) {
            const { shareMemory } = subPackages;
            const originalSplitChunks = config.optimization.get('splitChunks');
            const { vendor: originalVendor = {} } = originalSplitChunks.cacheGroups || {};

            if (shareMemory) {
              config.optimization.runtimeChunk({ name: 'webpack-runtime' });
            }
            config.optimization.splitChunks({
              ...originalSplitChunks,
              cacheGroups: {
                ...originalSplitChunks.cacheGroups,
                vendor: {
                  ...originalVendor,
                  chunks: 'all',
                  name: 'vendors',
                  minChunks: 2,
                  test({ context: filepath }) {
                    // If shareMemory is true, every common files should be splited to vendors.js
                    if (shareMemory) {
                      return true;
                    }
                    if (typeof originalVendor.test === 'function') {
                      return originalVendor.test(filepath);
                    }
                    if (originalVendor.test instanceof RegExp) {
                      return originalVendor.test.test(filepath);
                    }
                    if (typeof originalVendor.test === 'string') {
                      return new RegExp(originalVendor.test).test(filepath);
                    }
                    return false;
                  },
                },
              },
            });
            if (config.plugins.has('MiniCssExtractPlugin')) {
              config.plugin('MiniCssExtractPlugin').tap((options) => [
                {
                  ...options[0],
                  ignoreOrder: true,
                },
              ]);
            }
          }

          setConfig(config, {
            api,
            target,
            modernMode: true,
            outputPath,
            staticConfig: {
              ...staticConfig,
              routes: normalRoutes,
            },
            nativeRoutes,
          });

          // If miniapp-compiled dir exists, register a new task
          const compiledComponentsPath = path.resolve(rootDir, 'src', MINIAPP_COMPILED_DIR);
          if (fs.existsSync(compiledComponentsPath)) {
            const compiledComponentsTaskName = `rax-compiled-components-${target}`;
            const compiledComponentsChainConfig = getWebpackBase(api, {
              target: compiledComponentsTaskName,
              babelConfigOptions: { styleSheet: inlineStyle, disableRegenerator: true },
            });
            compiledComponentsChainConfig.plugins.delete('ProgressPlugin');
            compiledComponentsChainConfig.name(compiledComponentsTaskName);
            compiledComponentsChainConfig.taskName = compiledComponentsTaskName;

            setComponentCompileConfig(
              compiledComponentsChainConfig,
              { disableCopyNpm },
              {
                target,
                context,
                outputPath: path.resolve(rootDir, outputDir, target, MINIAPP_COMPILED_DIR),
                entryPath: path.join('src', MINIAPP_COMPILED_DIR, 'index'),
              },
            );
            registerTask(compiledComponentsTaskName, compiledComponentsChainConfig);
          }
        }
      });
    }
  });
};
