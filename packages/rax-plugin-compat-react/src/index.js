module.exports = ({ context, chainWebpack }) => {
  chainWebpack((config) => {
    const targets = context.__configArr.map(v => v.name);

    if (~targets.indexOf('web')) {
      const webConfig = config.getConfig('web');
      webConfig.resolve.alias
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
    }
  });
};
