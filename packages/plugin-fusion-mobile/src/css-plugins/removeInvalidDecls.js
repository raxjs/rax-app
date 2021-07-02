const postcss = require('postcss');

/**
 * remove invalid css properties, such as:
 * { color: undefined }
 */
module.exports = postcss.plugin('postcss-remove-invalid-decls', () => {
  return (root) => {
    root.walkDecls((delc) => {
      if (delc.value === 'undefined') {
        delc.remove();
      }
    });
  };
});
