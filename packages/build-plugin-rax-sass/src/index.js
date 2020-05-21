const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const inlineStandardList = [
  'weex', 'karken',
];

const nodeStandard = [
  'ssr',
];

const miniappStandardList = [
  'miniapp',
  'wechat-miniprogram',
];

module.exports = ({ onGetWebpackConfig, getValue, context }) => {
  const { userConfig = {} } = context;
  const inlineStyle = userConfig.inlineStyle || true;

  const targets = getValue('targets');
  targets.forEach(target => {
    const isInlineStandard = inlineStandardList.includes(target);
    const isMiniAppStandard = miniappStandardList.includes(target);
    const isNodeStandard = nodeStandard.includes(target);

    onGetWebpackConfig(target, (config) => {
      config.module
        .rule('sass')
        .test(/\.s[ac]ss$/);

      if (isNodeStandard && !inlineStyle) {
        // don't need to generate duplicate css files
        config.module
          .rule('sass')
          .use('ignorecss')
          .loader(require.resolve('null-loader'))
          .end();

        return;
      }

      if (inlineStyle || isInlineStandard) {
        config.module
          .rule('sass')
          .use('css')
          .loader(require.resolve('stylesheet-loader'))
          .options({
            transformDescendantCombinator: true,
          })
          .end();
      } else {
        config.module
          .rule('sass')
          .use('minicss')
          .loader(MiniCssExtractPlugin.loader)
          .end();
      }

      if (isInlineStandard) {
        // don't need to use postcss-loader
      } else if (isMiniAppStandard) {
        // only need to use postcss-loader when inlineStyle is false
        !inlineStyle && config.module
          .rule('sass')
          .use('postcss')
          .loader(require.resolve('postcss-loader'))
          .options({
            plugins: [
              require('postcss-preset-env')({
                autoprefixer: {
                  flexbox: 'no-2009',
                },
                stage: 3,
              })
            ]
          })
          .end();
      } else {
        // change rpx to vw
        config.module
          .rule('sass')
          .use('postcss')
          .loader(require.resolve('postcss-loader'))
          .options({
            plugins: [
              require('postcss-plugin-rpx2vw')()
            ]
          })
          .end();
      }

      config.module
        .rule('sass')
        .use('sass-loader').loader('sass-loader');
    });
  });
};
