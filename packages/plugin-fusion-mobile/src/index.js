const setImport = require('./config/set-import');

module.exports = (api) => {
  const { onGetWebpackConfig } = api;

  onGetWebpackConfig((config) => {
    setImport(config);
  });
};
