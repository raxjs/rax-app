const getDistConfig = require('./getDistConfig');
const _ = require('lodash');

module.exports = (context, options) => {
  const config = getDistConfig(context, options);
  const {pkg} = context;
  const pkgName = _.camelCase(pkg.name || '');

  config.output.library(pkgName);
  config.output.libraryTarget('umd');
  config.output.filename('index.umd.js');

  return config;
};
