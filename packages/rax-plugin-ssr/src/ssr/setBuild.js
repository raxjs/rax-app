module.exports = (config) => {
  config.optimization.minimize(false);
  ['jsx', 'tsx'].forEach(tag => {
    config.module.rule(tag)
      .use('platform')
      .options({
        platform: 'node',
      });
  });
};
