const { resolve } = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { WEB, WEEX, DOCUMENT, KRAKEN, MINIAPP, WECHAT_MINIPROGRAM } = require('../../../constants');

const configPath = resolve(__dirname, '../..');

const webStandardList = [
  WEB,
];

const inlineStandardList = [
  WEEX, KRAKEN,
];

const miniappStandardList = [
  MINIAPP,
  WECHAT_MINIPROGRAM,
];

module.exports = {
  defaultValue: true,
  validation: 'boolean',
  configWebpack: (config, value, context) => {
    const { userConfig, taskName } = context;
    const { publicPath } = userConfig;

    const cssRule = config.module.rule('css').test(/\.css$/).exclude.add(/\.module\.css$/).end();
    const cssModuleRule = config.module.rule('css-module').test(/\.module\.css$/);
    setCSSRule(cssRule, context, value);
    setCSSRule(cssModuleRule, context, value, true);

    const lessRule = config.module.rule('less').test(/\.less$/).exclude.add(/\.module\.less$/).end();
    const lessModuleRule = config.module.rule('less-module').test(/\.module\.less$/);
    setCSSRule(lessRule, context, value);
    setCSSRule(lessModuleRule, context, value, true);

    const sassRule = config.module.rule('sass').test(/\.s[ac]ss$/).exclude.add(/\.module\.s[ac]ss$/).end();
    const sassModuleRule = config.module.rule('sass-module').test(/\.module\.s[ac]ss$/);
    setCSSRule(sassRule, context, value);
    setCSSRule(sassModuleRule, context, value, true);

    if (inlineStandardList.includes(taskName) || value) {
      [lessRule, lessModuleRule].forEach(configRule => {
        configRule
          .use('less')
          .loader(require.resolve('less-loader'));
      });
    } else if ((webStandardList.includes(taskName) || miniappStandardList.includes(taskName)) && !value) {
      [lessRule, lessModuleRule].forEach(configRule => {
        configRule
          .oneOf('raw')
          .use('less')
          .loader(require.resolve('less-loader'))
          .end()
          .end()
          .oneOf('normal')
          .use('less')
          .loader(require.resolve('less-loader'));
      });

      // publicPath should not work in miniapp
      const cssFilename = (taskName === MINIAPP || taskName === WECHAT_MINIPROGRAM || !publicPath.startsWith('.')) ? `${taskName}/[name].css` : '';
      config.plugin('minicss')
        .use(MiniCssExtractPlugin, [{
          filename: cssFilename,
          ignoreOrder: true
        }]);
    }

    [sassRule, sassModuleRule].forEach(configRule => {
      configRule
        .use('sass')
        .loader(require.resolve('sass-loader'));
    });
  },
};

function setCSSRule(configRule, context, value, isCSSModule) {
  const { taskName } = context;
  const isInlineStandard = inlineStandardList.includes(taskName);
  const isWebStandard = webStandardList.includes(taskName);
  const isMiniAppStandard = miniappStandardList.includes(taskName);
  const isNodeStandard = taskName === DOCUMENT;

  if (value) {
    // enbale inlineStyle
    if (isInlineStandard || isMiniAppStandard) {
      configInlineStyle(configRule);
    } else {
      // Only web need transfrom rpx to vw
      configInlineStyle(configRule)
        .end()
        .use('postcss')
        .loader(require.resolve('postcss-loader'))
        .options({
          config: {
            path: configPath,
            ctx: {
              type: 'inline'
            },
          },
        });
    }
  } else {
    if (isWebStandard || isMiniAppStandard) {
      const postcssConfig = {
        config: {
          path: configPath,
          ctx: {
            type: isWebStandard ? 'web' : 'miniapp'
          },
        },
      };
      const cssLoaderOptions = isCSSModule ? {
        modules: {
          localIdentName: '[folder]--[local]--[hash:base64:7]',
        }
      } : {};

      configRule
        .use('minicss')
        .loader(MiniCssExtractPlugin.loader)
        .end()
        .use('css')
        .loader(require.resolve('css-loader'))
        .options(cssLoaderOptions)
        .end()
        .use('postcss')
        .loader(require.resolve('postcss-loader'))
        .options(postcssConfig)
        .end();
    } else if (isInlineStandard) {
      configInlineStyle(configRule);
    } else if (isNodeStandard) {
      // Do not generate CSS file, it will be built by web complier
      configRule
        .use('ignorecss')
        .loader(require.resolve('null-loader'))
        .end();
    }
  }
}

function configInlineStyle(configRule) {
  return configRule
    .use('css')
    .loader(require.resolve('stylesheet-loader'))
    .options({
      transformDescendantCombinator: true,
    });
}
