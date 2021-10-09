/**
 * remove invalid css properties, such as:
 * { color: undefined }
 */
module.exports = () => {
  return {
    postcssPlugin: 'postcss-remove-invalid-decls',
    Once(root) {
      root.walkDecls((delc) => {
        if (delc.value === 'undefined') {
          delc.remove();
        }
      });
    },
  };
};
