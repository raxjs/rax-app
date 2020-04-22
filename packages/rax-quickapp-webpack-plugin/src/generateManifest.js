
const fs = require('fs-extra');
const path = require('path');

const defaultManifestJSON = require('./utils/defaultManifest.json');

module.exports = (options) => {
  const quickappJSON = defaultManifestJSON;
  const { distDirectory } = options;
  if (fs.existsSync(path.join(distDirectory, '/src/app.json'))) {
    // generate router
    const appConfig = fs.readJSONSync(path.join(distDirectory, '/src/app.json'));
    const pages = appConfig.pages || [];
    const routerPages = {};
    pages.forEach(element => {
      const pageConf = {
        component: path.basename(element),
      };
      routerPages[path.dirname(element)] = pageConf;
    });
    const routerEntry = pages.shift();
    const router = {
      entry: path.dirname(routerEntry),
      pages: routerPages,
    };

    // generate display
    const display = JSON.parse(JSON.stringify(appConfig.window || {}));
    display.pages = {};

    if (appConfig.window && appConfig.window.defaultTitle) {
      quickappJSON.name = appConfig.window.defaultTitle;
    }

    quickappJSON.router = router;
    quickappJSON.display = display;

    // merge config in app.json
    Object.assign(quickappJSON, appConfig.config);

    fs.writeFileSync(path.join(distDirectory, '/src/manifest.json'), JSON.stringify(quickappJSON, null, 2));
  }
};
