const { getOptions } = require('loader-utils');
const transformAppConfig = require('./transformAppConfig');
const { dirname, join } = require('path');
const { writeFileSync, writeJSONSync } = require('fs-extra');

module.exports = function(appJSON) {
  const { outputPath, target, type } = getOptions(this);
  const appConfig = JSON.parse(appJSON);
  const config = transformAppConfig(dirname(this.resourcePath), appConfig, target);
  writeJSONSync(join(outputPath, 'app.json'), config, {
    spaces: 2
  });
  if (type === 'complie') {
    writeFileSync(join(outputPath, 'app.config.js'), `module.exports = ${JSON.stringify(config, null, 2)}`);
  }
  return appJSON;
};
