const fs = require('fs-extra');
const path = require('path');
const manifestHelpers = require('./manifestHelpers');

const { transformAppConfig, getPageManifestByPath } = manifestHelpers;

module.exports = (option) => {
  const { config, context, appConfigWriteToHTML, nsr } = option;
  const enableNSR = nsr && nsr.enable;

  if (!appConfigWriteToHTML && !enableNSR) {
    return;
  }

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
        decamelizeAppConfig
      });

      const manifestData = {
        manifest: pageManifestData,
        path
      };
      if (enableNSR) {
        const { dataConfig = 'static' } = nsr;
        if (dataConfig !== 'static') {
          // prefetch data is simple, generate meta
          manifestData.dataConfig = dataConfig;
        }
      }
      manifests.push(manifestData);
    });
  }
  config.plugin('document').tap(args => {
    return [{
      ...args[0],
      manifests
    }];
  });
};