const fs = require('fs-extra');
const path = require('path');
const manifestHelpers = require('./manifestHelpers');

const { transformAppConfig, getPageManifestByPath } = manifestHelpers;

module.exports = (option) => {
  const { config, context, appConfigWriteToHTML, nsr } = option;

  if (!appConfigWriteToHTML && !nsr) {
    return;
  }

  const { rootDir } = context;
  const appConfig = fs.readJsonSync(path.resolve(rootDir, 'src/app.json'));
  const decamelizeAppConfig = transformAppConfig(appConfig);
  const configs = [];

  if (appConfig.routes && appConfig.routes.length > 0) {
    appConfig.routes.map((router) => {
      const { path } = router;
      const pageManifestData = getPageManifestByPath({
        ...option,
        path,
        decamelizeAppConfig
      });

      const config = {
        manifest: pageManifestData,
        path
      };
      configs.push(config);
    });
  }
  config.plugin('document').tap(args => {
    return [{
      ...args[0],
      phaConfigs: configs
    }];
  });
};