const fs = require('fs');
const path = require('path');
const shell = require('shelljs');

const generateYaml = require('./generateYaml');

module.exports = ({ chainWebpack, context }, options = {}) => {
  const { command, onHook } = context;

  chainWebpack((config) => {
    if (command !== 'build' && command !== 'dev') {
      return;
    }

    const ssrConfig = config.getConfig('ssr');

    const root = context.rootDir;
    const appJSON = require(path.resolve(root, 'src/app.json'));
    const packageJSON = require(path.resolve(root, 'package.json'));

    const routes = appJSON.routes;

    const fns = routes.map(route => {
      if (!route.name) {
        throw new Error(`function name for component '${route.source}' is missing, please config it in 'app.json'`);
      }

      return {
        name: route.name,
        handler: `${route.name}.render`,
        methods: ['GET'],
        path: '.',
      }
    });

    const output = path.resolve(root, 'build/server');

    if (command === 'build') {
      onHook('after.build', () => {
        generateYaml({
          name: packageJSON.name,
          functionArr: fns,
        }, output);
      });
    }

    if (command === 'dev') {
      // 构建到本地，交给 fun 使用
      ssrConfig.devServer.set('writeToDisk', true);

      // 删除默认的 dev server
      ssrConfig.devServer.delete('before');

      const dist = path.resolve(root, 'build')
      if (!fs.existsSync(dist)) {
        fs.mkdirSync(dist)
      }

      if (!fs.existsSync(output)) {
        fs.mkdirSync(output)
      }

      generateYaml({
        name: packageJSON.name,
        functionArr: fns,
      }, output);

      let funCmd = 'fun local start';

      if (options.debug) {
        funCmd = `fun local start -d ${options.debugPort || 9229}`;
      }

      shell.exec(`cd ${output} && npx ${funCmd}`, { async: true })
    }
  });
};