module.exports = ({ context, chainWebpack }) => {
  chainWebpack((config) => {
    const targets = context.__configArr.map(v => v.name);

    if (~targets.indexOf('web')) {
      const webConfig = config.getConfig('web');
      webConfig.resolve.alias
        .set('react', 'rax/lib/compat')
        .set('react-dom', 'rax-dom')
    }
  });
};
