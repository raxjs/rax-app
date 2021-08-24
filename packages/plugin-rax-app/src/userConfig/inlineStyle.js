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
    configInlineStyle(configRule, 'normal');
    return;
  }

  const postCssType = isWebStandard ? 'web' : 'normal';

  if (isWebStandard || isMiniAppStandard) {
    if (value) {
      // value is `true || { forceEnableCSS: true } || { forceEnableCSS: false }`
      if (value.forceEnableCSS) {
        // value is `{ forceEnableCSS: true }`
        if (type === 'module') {
          // rule is `css-module`
          // extract `*.module.(c|le|sc)ss`
          configPostCssLoader(configRule, postCssType);
        } else {
          // rule is `css`
          // exclude `global.(c|le|sc)ss`
          // create new rule to transform `global.(c|le|sc)ss`
          setCSSGlobalRule(config, { configRule, type, postCssType });
        }
      } else {
        configRule.uses.delete('MiniCssExtractPlugin.loader');
        configInlineStyle(configRule, isWebStandard ? 'web-inline' : 'normal');
      }
    } else {
      // value is `false`
      configPostCssLoader(configRule, postCssType);
    }
    return;
  }

  if (isNodeStandard) {
    // should not extract css when `isNodeStandard`
    configRule.uses.delete('MiniCssExtractPlugin.loader');
    if (value) {
      if (value.forceEnableCSS) {
        // value is `{ forceEnableCSS: true }`
        if (type === 'module') {
          // rule is `css-module`
          // transform `*.module.(c|le|sc)ss`
          configLoadersInNode(configRule);
        } else {
          // rule is `css`
          // exclude `global.(c|le|sc)ss`
          const cssGlobalReg = new RegExp(`src\\/global\\.${type}`);

          configRule.exclude.add(cssGlobalReg);
          configInlineStyle(configRule, 'web-inline');

          // create new rule to transform `global.(c|le|sc)ss`
          const cssGlobalRule = createCSSRule(config, `${type}-global`, cssGlobalReg);
          cssGlobalRule.uses.delete('MiniCssExtractPlugin.loader');
          configLoadersInNode(cssGlobalRule);
        }
      } else {
        configInlineStyle(configRule, 'web-inline');
      }
    } else {
      // Do not generate CSS file, it will be built by web complier
      configLoadersInNode(configRule);
    }
  }
}

function configInlineStyle(configRule, type) {
  return configPostCssLoader(configRule, type)
    .use('css-loader')
    .loader(require.resolve('stylesheet-loader'))
    .options({
      transformDescendantCombinator: true,
    })
    .end();
}

function configPostCssLoader(configRule, type) {
  return configRule
    .use('postcss-loader')
    .tap((options) => ({
      ...options,
      config: {
        path: configPath,
        ctx: {
          type,
        },
      },
    }))
    .end();
}

function configLoadersInNode(configRule) {
  return configRule
    .uses
    .delete('postcss-loader')
    .end()
    .use('css-loader')
    .tap((loaderOptions) => ({
      ...loaderOptions,
      onlyLocals: true,
    }))
    .end();
}

function setCSSGlobalRule(config, options) {
  const { configRule, type, postCssType } = options;
  const cssGlobalReg = new RegExp(`src\\/global\\.${type}`);

  configRule.exclude.add(cssGlobalReg);
  configRule.uses.delete('MiniCssExtractPlugin.loader');
  configInlineStyle(configRule, postCssType === 'web' ? 'web-inline' : postCssType);

  // create rule to process `global.(c|le|sa|sc)ss`
  const cssGlobalRule = createCSSRule(config, `${type}-global`, cssGlobalReg);
  configPostCssLoader(cssGlobalRule, postCssType);
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
