const { resolve } = require('path');
const { WEB, WEEX, DOCUMENT, SSR, KRAKEN, MINIAPP, WECHAT_MINIPROGRAM, BYTEDANCE_MICROAPP, BAIDU_SMARTPROGRAM, KUAISHOU_MINIPROGRAM } = require('../constants');
const { createCSSRule } = require('rax-webpack-config');

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

module.exports = (config, value, context) => {
  ['css', 'less', 'scss'].forEach((style) => {
    const cssRule = config.module.rule(style);
    const cssModuleRule = config.module.rule(`${style}-module`);
    setCSSRule(config, cssRule, context, value, style);
    setCSSRule(config, cssModuleRule, context, value, 'module');
  });
};

function setCSSRule(config, configRule, context, value, type) {
  const { taskName } = context;
  const isInlineStandard = inlineStandardList.includes(taskName);
  const isWebStandard = webStandardList.includes(taskName);
  const isMiniAppStandard = miniappStandardList.includes(taskName);
  const isNodeStandard = nodeStandardList.includes(taskName);

  // value is `true || { forceEnableCSS: false }`
  // delete `MiniCssExtractPlugin` when `forceEnableCSS` is false
  if ((value && !value.forceEnableCSS) || isInlineStandard || isNodeStandard) {
    config.plugins.delete('MiniCssExtractPlugin');
  }

  // `inlineStyle` should be enabled when target is `weex` or `kraken`
  if (isInlineStandard) {
    configRule.uses.delete('MiniCssExtractPlugin.loader');
    configInlineStyle(configRule);
    configPostCssLoader(configRule, 'normal');
    return;
  }

  if (isWebStandard) {
    // value is `true || { forceEnableCSS: true } || { forceEnableCSS: false }`
    if (value) {
      // value is `{ forceEnableCSS: true }`
      if (value.forceEnableCSS) {
        setCSSGlobalRule(config, configRule, type, isWebStandard);
      } else {
        configRule.uses.delete('MiniCssExtractPlugin.loader');
        configInlineStyle(configRule);
        configPostCssLoader(configRule, 'web-inline');
      }
    // value is `false`
    } else {
      configPostCssLoader(configRule, 'web');
    }
    return;
  }

  if (isMiniAppStandard) {
    // value is `true || { forceEnableCSS: true } || { forceEnableCSS: false }`
    if (value) {
      // value is `{ forceEnableCSS: true }`
      if (value.forceEnableCSS) {
        setCSSGlobalRule(config, configRule, type, isWebStandard);
      } else {
        configRule.uses.delete('MiniCssExtractPlugin.loader');
        configInlineStyle(configRule);
        configPostCssLoader(configRule, 'web-inline');
      }
    // value is `false`
    } else {
      configPostCssLoader(configRule, 'web');
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

function createCSSGlobalRule(config, type, reg) {
  return createCSSRule(config, `${type}-global`, reg, []);
}

function configPostCssLoader(rule, type) {
  return rule
    .use('postcss-loader')
    .tap(getPostCssConfig.bind(null, type));
}

function setCSSGlobalRule(config, configRule, type, isWebStandard) {
  // rule is `css-module`
  // extract `*.module.(c|le|sa|sc)ss`
  if (type === 'module') {
    configPostCssLoader(configRule, 'web');
  // rule is `css`
  // exclude `global.(c|le|sa|sc)ss`
  } else {
    const cssGlobalReg = new RegExp(`src\\/global\\.${type}`);

    configRule.exclude.add(cssGlobalReg);
    configRule.uses.delete('MiniCssExtractPlugin.loader');
    configInlineStyle(configRule);
    configPostCssLoader(configRule, 'web-inline');

    // create rule to process `global.(c|le|sa|sc)ss`
    const cssGlobalRule = createCSSGlobalRule(config, type, cssGlobalReg);
    configPostCssLoader(cssGlobalRule, isWebStandard ? 'web' : 'normal');
  }
}
