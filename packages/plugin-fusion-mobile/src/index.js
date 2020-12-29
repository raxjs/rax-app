const extractImport = require('./config/extract-import');

module.exports = (api) => {
  const { onGetWebpackConfig } = api;

  onGetWebpackConfig((config) => {
    extractImport(config);
  });
};
