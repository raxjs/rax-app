module.exports = ({ onGetWebpackConfig, getValue }) => {
  const targets = getValue('targets');
  targets.forEach(target => {
    onGetWebpackConfig(target, (config) => {
      config.resolve.alias
        .set('react', 'rax/lib/compat')
        .set('react-dom', 'rax-dom');
    });
  });
};
