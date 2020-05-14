
const path = require('path');
const Module = require('module');
const fse = require('fs-extra');
const { parse, print } = require('error-stack-tracey');

function exec(code, filename, filePath) {
  const module = new Module(filename, this);
  module.paths = Module._nodeModulePaths(filePath);
  module.filename = filename;
  module._compile(code, filename);
  return module.exports;
}

module.exports = (config, routes, options) => {
  config.mode('development');

  const distDir = config.output.get('path');
  const filename = config.output.get('filename');
  routes.forEach((route) => {
    route.componentPath = path.join(distDir, filename.replace('[name]', route.entryName));
  });

  config.devServer.hot(false);

  // There can only be one `before` config, this config will overwrite `before` config in web plugin.
  config.devServer.set('before', (app, devServer) => {
    const compilers = devServer.compiler.compilers;

    const compiler = compilers.find(compiler => {
      return compiler.name === 'ssr';
    });

    let compilationAssets = {};
    const httpTaskQueue = [];

    compiler.hooks.emit.tap(
      'AppHistoryFallback',
      (compilation, callback) => {
        for (const [, entrypoint] of compilation.entrypoints.entries()) {
          const files = entrypoint.getFiles();
          const entryFile = files[0];
          compilationAssets[entrypoint.name] = compilation.assets[entryFile];
        }

        let task;
        // eslint-disable-next-line
        while (task = httpTaskQueue.shift()) {
          task();
        }
      }
    );

    routes.forEach((route) => {
      app.get(route.path, function(req, res) {
        const send = async() => {
          if (!compilationAssets[route.entryName]) {
            console.error(`Bundle is not found for ${routes.path}`);
            return;
          }

          const buildManifest = fse.readFileSync(options.buildManifestPath);
          const mainifestJSON = JSON.parse(buildManifest);

          const bundleContent = compilationAssets[route.entryName].source();

          // insert build-manifest.json to get assets map for page
          const newBundle = bundleContent.replace(/__BUILD_MANIFEST__/, JSON.stringify(mainifestJSON));

          process.once('unhandledRejection', async(error) => {
            const errorStack = await parse(error, newBundle);
            print(error.message, errorStack);
          });

          try {
            const mod = exec(newBundle, route.componentPath, route.componentPath);
            mod.render(req, res);
          } catch (error) {
            const errorStack = await parse(error, newBundle);
            print(error.message, errorStack);
          }
        };

        if (compilationAssets) {
          send();
        } else {
          httpTaskQueue.push(send);
        }
      });
    });
  });

  return config;
};
