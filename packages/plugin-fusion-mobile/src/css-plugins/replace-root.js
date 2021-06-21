const postcss = require('postcss');

/**
 * repalce page -> :root for wechat-miniprogram
 */
module.exports = postcss.plugin('postcss-replace-root', () => {
  return (root) => {
    root.walkRules((rule) => {
      if (rule.selector === 'page') {
        rule.selector = ':root';
      }
    });
  };
});
