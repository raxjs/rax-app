const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { WEB, WEEX, NODE, KRAKEN, MINIAPP, WECHAT_MINIPROGRAM } = require('../../../constants');

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
    const { taskName } = context;

    setCSSRule(config.module.rule('css').test(/\.css?$/), context, value);
    setCSSRule(config.module.rule('less').test(/\.less?$/), context, value);

    if (inlineStandardList.includes(taskName) || value) {
      config.module.rule('less')
        .use('less')
        .loader(require.resolve('less-loader'));
    } else if (webStandardList.includes(taskName) && !value) {
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
          filename: `${taskName}/[name].css`,
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
  const isNodeStandard = taskName === NODE;
  // enbale inlineStyle
  if (value) {
    if (isInlineStandard || isMiniAppStandard) {
      configInlineStyle(configRule);
    } else if (isWebStandard) {
      // Onlu web need transfrom rpx to vw
      configInlineStyle(configRule)
        .end()
        .use('postcss')
        .loader(require.resolve('postcss-loader'))
        .options({
          ident: 'postcss',
          plugins: () => [
            require('postcss-plugin-rpx2vw')(),
          ],
        });
    }
  } else {
    if (isWebStandard || isMiniAppStandard) {
      // extract css file in web while inlineStyle is disabled
      const postcssConfig = {
        ident: 'postcss',
        plugins: () => [
          require('postcss-preset-env')({
            autoprefixer: {
              flexbox: 'no-2009',
            },
            stage: 3,
          }),
          isWebStandard && require('postcss-plugin-rpx2vw')(),
        ],
      };

      configRule
        .use('minicss')
        .loader(MiniCssExtractPlugin.loader)
        .end()
        .oneOf('raw')
        .resourceQuery(resourceQuery ? new RegExp(resourceQuery) : /\?raw$/)
        .use('css')
        .loader(require.resolve('css-loader'))
        .end()
        .use('postcss')
        .loader(require.resolve('postcss-loader'))
        .options(postcssConfig)
        .end()
        .end()
        .oneOf('normal')
        .use('css')
        .loader(require.resolve('css-loader'))
      // reference: https://github.com/webpack-contrib/css-loader/tree/v2.1.1#localidentname
        .options(
          modules ? {
            importLoaders: 2,
            modules: true,
            localIdentName: '[name]__[local]--[hash:base64:5]',
          } : {})
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
        .loader(require.resolve('../../../loaders/ignoreLoader'))
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
