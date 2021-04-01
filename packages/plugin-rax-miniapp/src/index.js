const path = require('path');
const fs = require('fs-extra');
const { platformMap } = require('miniapp-builder-shared');
const { setConfig } = require('miniapp-runtime-config');
const {
  setAppConfig: setAppCompileConfig,
  setComponentConfig: setComponentCompileConfig,
} = require('miniapp-compile-config');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const setEntry = require('./setEntry');
const { GET_RAX_APP_WEBPACK_CONFIG, MINIAPP_COMPILED_DIR } = require('./constants');

module.exports = (api) => {
  const { getValue, context, registerTask, onGetWebpackConfig, registerUserConfig } = api;
  const { userConfig } = context;
  const { targets, inlineStyle, vendor } = userConfig;

  const getWebpackBase = getValue(GET_RAX_APP_WEBPACK_CONFIG);
  targets.forEach((target) => {
    if (['miniapp', 'wechat-miniprogram', 'bytedance-microapp'].includes(target)) {
      const chainConfig = getWebpackBase(api, {
        target,
        babelConfigOptions: { styleSheet: inlineStyle, disableRegenerator: true },
        progressOptions: {
          name: platformMap[target].name,
        },
      });
      chainConfig.name(target);
      chainConfig.taskName = target;
      const isCompileProject = userConfig[target] && userConfig[target].buildType === 'compile';
      // Set Entry when it's runtime project
      if (!isCompileProject) {
        setEntry(chainConfig, context, target);
      }
      // Register task
      registerTask(target, chainConfig);
      registerUserConfig({
        name: target,
        validation: 'object',
      });

      onGetWebpackConfig(target, (config) => {
        // eslint-disable-next-line @typescript-eslint/no-shadow
        const { rootDir, userConfig } = context;
        const { outputDir = 'build' } = userConfig;
        // Set output dir
        const outputPath = path.resolve(rootDir, outputDir, target);
        config.output.path(outputPath);

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

        if (isCompileProject) {
          setAppCompileConfig(config, userConfig[target] || {}, {
            target,
            context,
            outputPath,
            entryPath: './src/app',
          });
        } else {
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
