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
    setCSSRule(config, { configRule: cssRule, context, value, type: style });
    setCSSRule(config, { configRule: cssModuleRule, context, value, type: 'module' });
  });

  const { taskName } = context;
  deleteExtractCSSPlugin(config, value, taskName);
};

function setCSSRule(config, options) {
  const { configRule, context, value, type } = options;
  const { taskName } = context;
  const isInlineStandard = inlineStandardList.includes(taskName);
  const isWebStandard = webStandardList.includes(taskName);
  const isMiniAppStandard = miniappStandardList.includes(taskName);
  const isNodeStandard = nodeStandardList.includes(taskName);

  // `inlineStyle` should be enabled when target is `weex` or `kraken`
  if (isInlineStandard) {
    configRule.uses.delete('MiniCssExtractPlugin.loader');
    configInlineStyle(configRule);
    configPostCssLoader(configRule, 'normal');
    return;
  }

  if (isWebStandard || isMiniAppStandard) {
    // value is `true || { forceEnableCSS: true } || { forceEnableCSS: false }`
    if (value) {
      // value is `{ forceEnableCSS: true }`
      if (value.forceEnableCSS) {
        setCSSGlobalRule(config, configRule, type, isWebStandard ? 'web' : 'normal');
      } else {
        configRule.uses.delete('MiniCssExtractPlugin.loader');
        configInlineStyle(configRule);
        configPostCssLoader(configRule, 'web-inline');
      }
    // value is `false`
    } else {
      configPostCssLoader(configRule, isWebStandard ? 'web' : 'normal');
    }
    return;
  }

  if (isNodeStandard) {
    configRule.uses.delete('MiniCssExtractPlugin.loader');
    if (value) {
      configInlineStyle(configRule);
      configPostCssLoader(configRule, 'web-inline');
    } else {
      // Do not generate CSS file, it will be built by web complier
      configRule.uses.delete('postcss-loader');
      configRule
        .use('css-loader')
        .tap((loaderOptions) => ({
          ...loaderOptions,
          onlyLocals: true,
        }))
        .end();
    }
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

function configPostCssLoader(rule, type) {
  rule
    .use('postcss-loader')
    .tap((options) => ({
      ...options,
      config: {
        path: configPath,
        ctx: {
          type,
        },
      },
    }));
}

function setCSSGlobalRule(config, configRule, type, postCssType) {
  // rule is `css-module`
  // extract `*.module.(c|le|sa|sc)ss`
  if (type === 'module') {
    configPostCssLoader(configRule, postCssType);
  // rule is `css`
  // exclude `global.(c|le|sa|sc)ss`
  } else {
    const cssGlobalReg = new RegExp(`src\\/global\\.${type}`);

    configRule.exclude.add(cssGlobalReg);
    configRule.uses.delete('MiniCssExtractPlugin.loader');
    configInlineStyle(configRule);
    configPostCssLoader(configRule, 'web-inline');

    // create rule to process `global.(c|le|sa|sc)ss`
    const cssGlobalRule = createCSSRule(config, `${type}-global`, cssGlobalReg, []);
    configPostCssLoader(cssGlobalRule, postCssType);
  }
}

function deleteExtractCSSPlugin(config, value, taskName) {
  const isInlineStandard = inlineStandardList.includes(taskName);
  const isNodeStandard = nodeStandardList.includes(taskName);

  // taskName is `weex` `kraken` `ssr` or `document`
  // delete `MiniCssExtractPlugin`
  if (isInlineStandard || isNodeStandard) {
    config.plugins.delete('MiniCssExtractPlugin');
    return;
  }

  // value is `true || { forceEnableCSS: false }`
  // delete `MiniCssExtractPlugin` when `forceEnableCSS` is false
  if (value && !value.forceEnableCSS) {
    config.plugins.delete('MiniCssExtractPlugin');
  }
}
