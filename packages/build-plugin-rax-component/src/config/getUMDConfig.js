const getDistConfig = require('./getDistConfig');

function toCamelCase(key) {
  let strArray = key.split(/_|-/);
  let humpStr = strArray[0];
  for (let i = 1, l = strArray.length; i < l; i += 1) {
    humpStr += strArray[i].slice(0, 1).toUpperCase() + strArray[i].slice(1);
  }
  return humpStr;
}

module.exports = (context, options) => {
  const config = getDistConfig(context, options);
  const {pkg} = context;
  const pkgName = toCamelCase(pkg.name || '');

  config.output.library(pkgName);
  config.output.libraryTarget('umd');
  config.output.filename('index.umd.js');

  return config;
};
