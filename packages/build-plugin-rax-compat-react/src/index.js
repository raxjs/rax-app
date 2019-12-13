module.exports = ({ onGetWebpackConfig, getValue }) => {
  const targets = getValue('targets');

  if (targets.includes('web')) {
    onGetWebpackConfig('web', (config) => {
      config.resolve.alias
        .set('react', 'rax/lib/compat')
        .set('react-dom', 'rax-dom');

      ['jsx', 'tsx'].forEach(tag => {
        config.module.rule(tag)
          .use('replace')
          .loader(require.resolve('string-replace-loader'))
          .options({
            search: 'import React from',
            replace: 'import { createElement } from',
          });
      });
    });
  }
};
