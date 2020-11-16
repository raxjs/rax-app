/* eslint-disable */
const fs = require('fs-extra');
const path = require('path');
const manifestHelpers = require('./manifestHelpers');

const { transformAppConfig, getPageManifestByPath } = manifestHelpers;

module.exports = (option) => {
  const { config, context, appConfigWriteToHTML, nsr } = option;

  if (!appConfigWriteToHTML && !nsr) {
    return;
  }
  const publicPath = config.output.get('publicPath') || '/';

  const { rootDir } = context;
  const appConfig = fs.readJsonSync(path.resolve(rootDir, 'src/app.json'));
  const decamelizeAppConfig = transformAppConfig(appConfig);
  const manifests = [];

  if (appConfig.routes && appConfig.routes.length > 0) {
    appConfig.routes.map((router) => {
      const { path } = router;
      const pageManifestData = getPageManifestByPath({
        ...option,
        path,
        publicPath,
        decamelizeAppConfig,
      });

      manifests.push({
        data: pageManifestData,
        path,
      });
    });
  }
  config.plugin('document').tap((args) => {
    return [{
      ...args[0],
      manifests,
    }];
  });
};
