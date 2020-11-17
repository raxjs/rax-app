module.exports = ({ onGetWebpackConfig }) => {
  onGetWebpackConfig((config) => {
    config.resolve.alias
      .set('react', 'rax/lib/compat')
      .set('react-dom', 'rax-dom');
  });
};
