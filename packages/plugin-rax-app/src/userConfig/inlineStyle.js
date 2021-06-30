const { resolve } = require('path');
const { WEB, WEEX, DOCUMENT, SSR, KRAKEN, MINIAPP, WECHAT_MINIPROGRAM, BYTEDANCE_MICROAPP, BAIDU_SMARTPROGRAM, KUAISHOU_MINIPROGRAM } = require('../constants');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const configPath = resolve(__dirname, '../');

const webStandardList = [
  WEB,
];

const inlineStandardList = [
  WEEX, KRAKEN,
];

const miniappStandardList = [
  MINIAPP,
  WECHAT_MINIPROGRAM,
  BYTEDANCE_MICROAPP,
  BAIDU_SMARTPROGRAM,
  KUAISHOU_MINIPROGRAM,
];

const nodeStandardList = [
  DOCUMENT,
  SSR,
];

const cssGlobalReg = /global\.(c|le|sa|sc)ss$/;

module.exports = (config, value, context) => {
  const { taskName } = context;

  ['css', 'less', 'scss'].forEach((style) => {
    const cssRule = config.module.rule(style);
    const cssModuleRule = config.module.rule(`${style}-module`);
    setCSSRule(config, cssRule, context, value, style);
    setCSSRule(config, cssModuleRule, context, value, 'module');
  });

  // delete `MiniCssExtractPlugin` when `forceEnableCSS` is false
  if (!value.forceEnableCSS || inlineStandardList.includes(taskName) || nodeStandardList.includes(taskName)) {
    config.plugins.delete('MiniCssExtractPlugin');
  }
};

function setCSSRule(config, configRule, context, value, type) {
  const { taskName } = context;
  const isInlineStandard = inlineStandardList.includes(taskName);
  const isWebStandard = webStandardList.includes(taskName);
  const isMiniAppStandard = miniappStandardList.includes(taskName);
  const isNodeStandard = nodeStandardList.includes(taskName);

  // `inlineStyle` should be enabled when target is weex or kraken
  if (isInlineStandard) {
    configRule.uses.delete('MiniCssExtractPlugin.loader');
    configInlineStyle(configRule)
      .use('postcss-loader')
      .tap(getPostCssConfig.bind(null, 'normal'));
    return;
  }

  if (isWebStandard || isMiniAppStandard) {
    if (value && value.forceEnableCSS) {
      if (type === 'module') {
        // extract `*.module.(c|le|sa|sc)ss`
        configRule
          .use('postcss-loader')
          .tap(getPostCssConfig.bind(null, isWebStandard ? 'web' : 'normal'))
          .end();
      } else {
        // exclude `global.(c|le|sa|sc)ss`
        configRule.exclude.add(cssGlobalReg);
        configRule.uses.delete('MiniCssExtractPlugin.loader');
        configInlineStyle(configRule)
          .use('postcss-loader')
          .tap(getPostCssConfig.bind(null, 'web-inline'))
          .end();

        // create new rule to process `global.(c|le|sa|sc)ss`
        const enableCSSRule = config.module.rule(`enable-${type}`);
        setEnableCSSRule(enableCSSRule, type, isWebStandard);
      }
    } else if (value && !value.forceEnableCSS) {
      // process style sheets inline when `inlineStyle` is an object
      // but `forceEnableCSS` is false
      configRule.uses.delete('MiniCssExtractPlugin.loader');
      configInlineStyle(configRule)
        .use('postcss-loader')
        .tap(getPostCssConfig.bind(null, 'web-inline'));
    } else {
      configRule
        .use('postcss-loader')
        .tap(getPostCssConfig.bind(null, isWebStandard ? 'web' : 'normal'))
        .end();
    }
    return;
  }

  if (isNodeStandard) {
    // Do not generate CSS file, it will be built by web complier
    configRule.uses.delete('postcss-loader');
    configRule.uses.delete('MiniCssExtractPlugin.loader');
    configRule
      .use('css-loader')
      .tap((options) => ({
        ...options,
        onlyLocals: true,
      }))
      .end();
  }
}

function configInlineStyle(configRule) {
  return configRule
    .use('css-loader')
    .loader(require.resolve('stylesheet-loader'))
    .options({
      transformDescendantCombinator: true,
    }).end();
}

function getPostCssConfig(type, options) {
  return {
    ...options,
    config: {
      path: configPath,
      ctx: {
        type,
      },
    },
  };
}

/**
 * create new rule to process `global.(c|le|sa|sc)ss`
 * when `target` is `web`
 * @param {*} configRule webpack config of webpack-chain
 * @param {string} style type of style in ['css', 'less', 'scss']
 * @param {boolean} isWebStandard is web standard
 */
function setEnableCSSRule(configRule, style, isWebStandard) {
  const enableCSSReg = new RegExp(`global\\.${style}$`);
  const cssLoaderOpts = {
    sourceMap: true,
  };

  configRule
    .test(enableCSSReg)
    .use('MiniCssExtractPlugin.loader')
    .loader(MiniCssExtractPlugin.loader)
    .options({
      esModule: false,
    })
    .end()
    .use('css-loader')
    .loader(require.resolve('css-loader'))
    .options(cssLoaderOpts)
    .end()
    .use('postcss-loader')
    .loader(require.resolve('postcss-loader'))
    .options(cssLoaderOpts)
    .tap(getPostCssConfig.bind(null, isWebStandard ? 'web' : 'normal'))
    .end();

  const loaderMap = {
    css: [],
    scss: [['sass-loader', require.resolve('sass-loader')]],
    less: [['less-loader', require.resolve('less-loader'), { lessOptions: { javascriptEnabled: true } }]],
  };

  loaderMap[style].forEach((loader) => {
    const [loaderName, loaderPath, loaderOpts = {}] = loader;
    configRule.use(loaderName)
      .loader(loaderPath)
      .options({ ...cssLoaderOpts, ...loaderOpts });
  });
}
