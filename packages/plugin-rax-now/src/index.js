const fs = require('fs');
const path = require('path');

module.exports = ({ onGetWebpackConfig, context, onHook }) => {
  const { command } = context;

  onGetWebpackConfig('ssr', (config) => {
    const root = context.rootDir;
    const appJSON = require(path.resolve(root, 'src/app.json'));
    const packageJSON = require(path.resolve(root, 'package.json'));

    const { routes } = appJSON;

    const nowJSON = {
      name: packageJSON.name,
      builds: [
        { src: '/web/**', use: '@now/static' },
        { src: '/node/**', use: '@now/node' },
      ],
      routes: [],
    };

    routes.forEach((route) => {
      let destFile = 'index';

      // Example: '/about/' -> 'about/index'
      if (route.path && route.path !== '/') {
        destFile = `${route.path.replace(/^\/|\/$/g, '')}/index`;
      }

      nowJSON.routes.push({
        src: route.path,
        dest: `/node/${destFile}.js`,
      });
    });

    const dest = path.resolve(root, 'build');

    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest);
    }

    if (command === 'build') {
      onHook('after.build.compile', () => {
        fs.writeFileSync(`${dest}/now.json`, JSON.stringify(nowJSON, null, 2), 'utf-8');
      });
    }

    if (command === 'start') {
      onHook('after.start.devServer', () => {
        fs.writeFileSync(`${dest}/now.json`, JSON.stringify(nowJSON, null, 2), 'utf-8');
      });

      // write files to disk for now dev
      config.devServer.set('writeToDisk', true);

      // delete the default dev server
      config.devServer.delete('before');
    }
  });
};
