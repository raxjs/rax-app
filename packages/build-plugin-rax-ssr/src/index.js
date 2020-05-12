const path = require('path');
const fse = require('fs-extra');
const klawSync = require('klaw-sync');
const getSSRBase = require('./ssr/getBase');
const setSSRBuild = require('./ssr/setBuild');
const setSSRDev = require('./ssr/setDev');
const setWebConfig = require('./web/setBase');

// can‘t clone webpack chain object
module.exports = ({ onGetWebpackConfig, registerTask, context, getValue, setValue, onHook }) => {
  process.env.RAX_SSR = 'true';
  const { rootDir, userConfig, command } = context;

  const appJSONPath = path.resolve(rootDir, 'src/app.json');
  const appJSON = fse.readJsonSync(appJSONPath);
  const routes = appJSON.routes;

  routes.forEach((route) => {
    route.entryName = getEntryName(route.path);
  });

  const { outputDir = 'build' } = userConfig;
  const buildDir = path.resolve(rootDir, outputDir);
  const buildManifestPath = path.resolve(buildDir, 'build-manifest.json');

  const ssrConfig = getSSRBase(context, routes, {
    buildManifestPath
  });

  registerTask('ssr', ssrConfig);

  // Add ssr to the target list, so other plugins can get the right target info, eg. build-plugin-rax-compat-react
  const targets = getValue('targets');
  targets.push('ssr');
  setValue('targets', targets);

  onGetWebpackConfig('web', (config) => {
    setWebConfig(config, routes, {
      buildManifestPath
    });
  });

  onGetWebpackConfig('ssr', (config) => {
    if (command === 'build') {
      setSSRBuild(config);
    } else {
      setSSRDev(config, routes, {
        buildManifestPath
      });
    }
  });

  // build-manifest.json is generate after web complier, which is run parallel.
  onHook('after.build.compile', () => {
    const buildManifest = JSON.stringify(require(buildManifestPath));

    const files = klawSync(path.resolve(buildDir, 'node'));
    files.map(fileInfo => {
      if (/\.js$/.test(fileInfo.path)) {
        const bundle = fse.readFileSync(fileInfo.path, 'utf-8');
        const newBundle = bundle.replace(/__BUILD_MANIFEST__/, buildManifest);
        fse.writeFileSync(fileInfo.path, newBundle, 'utf-8');
      }
    });

    fse.removeSync(buildManifestPath);
  });
};

/*
* Generate entryname by route.path
* Example: '/about/' -> 'about/index'
*/
function getEntryName(path) {
  let entryName = 'index';

  if (path && path !== '/') {
    entryName = `${path.replace(/^\/|\/$/g, '')}/index`;
  }

  return entryName;
};
