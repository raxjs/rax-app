import * as path from 'path';
import * as Module from 'module';
import * as fs from 'fs';
import * as errorStackTracey from 'error-stack-tracey';
import { getMpaEntries } from '@builder/app-helpers';
import getEntryName from './getEntryName';

const { parse, print } = errorStackTracey;

function exec(code, filename, filePath) {
  const module: any = new Module(filename, this);
  module.paths = (Module as any)._nodeModulePaths(filePath);
  module.filename = filename;
  module._compile(code, filename);
  return module.exports;
}

export default (config, api) => {
  const { context, getValue } = api;
  const { rootDir, userConfig } = context;
  const { web: webConfig = {}, outputDir } = userConfig;
  const distDir = path.join(rootDir, outputDir, 'node');

  config.mode('development');
  const staticConfig = getValue('staticConfig');
  const { routes } = staticConfig;

  if (webConfig.mpa) {
    const entries = getMpaEntries(api, { target: 'web', appJsonContent: staticConfig });
    routes.forEach((route) => {
      const { entryName } = entries.find(({ source }) => source === route.source);
      route.path = `/${entryName}.html`;
      route.entryName = entryName;
      route.componentPath = path.join(distDir, `${entryName}.js`);
    });
  } else {
    routes.forEach((route) => {
      const entryName = getEntryName(route.path);
      route.entryName = entryName;
      route.componentPath = path.join(distDir, `${entryName}.js`);
    });
  }

  // enable inline soucremap for get error stack
  config.devtool('eval-cheap-source-map');

  config.devServer.hot(false);
  const originalBeforeDevFunc = config.devServer.get('before');

  // There can only be one `before` config, this config will overwrite `before` config in web plugin.
  config.devServer.set('before', (app, devServer) => {
    if (originalBeforeDevFunc) {
      originalBeforeDevFunc(app, devServer);
    }
    // outputFileSystem in devServer is MemoryFileSystem by defalut, but it can also be custom with other file systems.
    const outputFs = devServer.compiler.compilers[0].outputFileSystem;
    routes.forEach((route) => {
      app.get(route.path, async (req, res) => {
        const bundleContent = outputFs.readFileSync(route.componentPath, 'utf8');

        process.once('unhandledRejection', async (error: Error) => {
          const errorStack = await parse(error, bundleContent);
          print(error.message, errorStack);
        });

        try {
          const mod = exec(bundleContent, route.componentPath, route.componentPath);
          mod.render(req, res);
        } catch (error) {
          console.log('exec error');
          fs.writeFileSync(path.resolve(rootDir, 'build', 'index.js'), bundleContent);
          const errorStack = await parse(error, bundleContent);
          print(error.message, errorStack);
        }
      });
    });
  });

  return config;
};
