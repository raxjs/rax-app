const fs = require('fs');
const path = require('path');

module.exports = ({ chainWebpack, context }) => {
  const { command, onHook } = context;

  chainWebpack((config) => {
    const ssrConfig = config.getConfig('ssr');

    const root = context.rootDir;
    const appJSON = require(path.resolve(root, 'src/app.json'));
    const packageJSON = require(path.resolve(root, 'package.json'));

    const routes = appJSON.routes;

    const nowJSON = {
      name: packageJSON.name,
      builds: [
        {src: '/web/*', use: '@now/static' },
        {src: '/server/*', use: '@now/node' },
      ],
      routes: [],
    };

    routes.forEach(route => {
      if (!route.name) {
        throw new Error(`function name for component '${route.source}' is missing, please config it in 'app.json'`);
      }

      nowJSON.routes.push({
        src: route.path,
        dest: `/server/${route.name}.js`,
      });
    });

    const dest = path.resolve(root, 'build');

    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest);
    }

    onHook(`after.${command}`, () => {
      fs.writeFileSync(`${dest}/now.json`, JSON.stringify(nowJSON, null, 2), 'utf-8');
    });

    if (command === 'dev') {
      // write files to disk for now dev
      ssrConfig.devServer.set('writeToDisk', true);

      // delete the default dev server
      ssrConfig.devServer.delete('before');
    }
  });
};