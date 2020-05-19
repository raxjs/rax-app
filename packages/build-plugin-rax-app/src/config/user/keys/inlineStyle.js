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

    setCSSRule(config.module.rule('css').test(/\.css?$/), context, value);
    setCSSRule(config.module.rule('less').test(/\.less?$/), context, value);

    if (inlineStandardList.includes(taskName) || value) {
      config.module.rule('less')
        .use('less')
        .loader(require.resolve('less-loader'));
    } else if ((webStandardList.includes(taskName) || miniappStandardList.includes(taskName)) && !value) {
      config.module.rule('less')
        .oneOf('raw')
        .use('less')
        .loader(require.resolve('less-loader'))
        .end()
        .end()
        .oneOf('normal')
        .use('less')
        .loader(require.resolve('less-loader'));

      config.plugin('minicss')
        .use(MiniCssExtractPlugin, [{
          filename: `${publicPath.startsWith('.') ? '' : `${taskName}/`}[name].css`,
          ignoreOrder: true
        }]);
    }
  },
};

function setCSSRule(configRule, context, value) {
  const { userConfig, taskName } = context;
  const { extraStyle = {} } = userConfig;
  const { cssModules = {} } = extraStyle;
  const { modules, resourceQuery } = cssModules;
  const isInlineStandard = inlineStandardList.includes(taskName);
  const isWebStandard = webStandardList.includes(taskName);
  const isMiniAppStandard = miniappStandardList.includes(taskName);
  const isNodeStandard = taskName === DOCUMENT;
  // enbale inlineStyle
  if (value) {
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
      configRule
        .use('minicss')
        .loader(MiniCssExtractPlugin.loader)
        .end()
        .use('css')
        .loader(require.resolve('css-loader'))
        .end()
        .use('postcss')
        .loader(require.resolve('postcss-loader'))
        .options(postcssConfig)
        .end()
        .use('css')
        .loader(require.resolve('css-loader'))
        .options({ modules })
        .end()
        .use('postcss')
        .loader(require.resolve('postcss-loader'))
        .options(postcssConfig);
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
