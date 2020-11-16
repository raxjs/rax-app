/* eslint-disable */
const fs = require('fs');
const path = require('path');
const shell = require('shelljs');

const generateYaml = require('./generateYaml');

module.exports = ({ onGetWebpackConfig, context, onHook }, options = {}) => {
  const { command } = context;

  onGetWebpackConfig('ssr', (config) => {
    const root = context.rootDir;
    const appJSON = require(path.resolve(root, 'src/app.json'));
    const packageJSON = require(path.resolve(root, 'package.json'));

    const { routes } = appJSON;

    const fns = routes.map((route) => {
      if (!route.name) {
        throw new Error(`function name for component '${route.source}' is missing, please config it in 'app.json'`);
      }

      // eslint-disable-next-line no-shadow
      let path = '.';

      // Example: '/about/' -> './about'
      if (route.path && route.path !== '/') {
        path = `./${route.path.replace(/^\/|\/$/g, '')}`;
      }

      return {
        name: route.name,
        handler: 'index.render',
        methods: ['GET'],
        path,
      };
    });

    const output = path.resolve(root, 'build/node');

    if (command === 'build') {
      onHook('after.build.compile', () => {
        generateYaml({
          name: packageJSON.name,
          functionArr: fns,
          runtime: options.runtime,
        }, output);
      });
    }

    if (command === 'start') {
      // write to dist for fun
      config.devServer.set('writeToDisk', true);

      // delete default dev server
      config.devServer.delete('before');

      const dist = path.resolve(root, 'build');
      if (!fs.existsSync(dist)) {
        fs.mkdirSync(dist);
      }

      if (!fs.existsSync(output)) {
        fs.mkdirSync(output);
      }

      let hasStartFun = false;

      // start fun after compile to avoid logs be cleared
      onHook('after.start.compile', async () => {
        if (hasStartFun) {
          return;
        }

        generateYaml({
          name: packageJSON.name,
          functionArr: fns,
        }, output);

        let funCmd = 'fun local start';

        if (options.debug) {
          funCmd = `fun local start -d ${options.debugPort || 9229}`;
        }

        shell.exec(`cd ${output} && npx ${funCmd}`, { async: true });

        hasStartFun = true;
      });
    }
  });
};
