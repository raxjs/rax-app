/**
 * repalce page -> :root for wechat-miniprogram
 */
module.exports = () => {
  return {
    postcssPlugin: 'postcss-replace-root',
    Once(root) {
      root.walkRules((rule) => {
        if (rule.selector === 'page') {
          rule.selector = ':root';
        }
      });
    },
  };
};
