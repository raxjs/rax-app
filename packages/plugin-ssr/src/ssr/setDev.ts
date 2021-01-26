import * as Module from 'module';
import * as fs from 'fs-extra';
import * as path from 'path';
import { NODE, STATIC_CONFIG, WEB } from '../constants';

export default function (api, config) {
  let serverReady = false;
  let httpResponseQueue = [];

  const originalDevServeBefore = config.devServer.get('before');
  config.devServer.inline(false);
  config.devServer.hot(false);
  config.devServer.set('before', (app, server) => {
    if (typeof originalDevServeBefore === 'function') {
      originalDevServeBefore(app, server);
    }
    let compilerDoneCount = 0;
    server.compiler.compilers.forEach((compiler) => {
      compiler.hooks.done.tap('ssrServer', () => {
        compilerDoneCount++;
        // wait until all compiler is done
        if (compilerDoneCount === server.compiler.compilers.length) {
          serverReady = true;
          httpResponseQueue.forEach(([req, res]) => {
            serverRender(res, req, api);
          });
          // empty httpResponseQueue
          httpResponseQueue = [];
        }
      });
    });

    const pattern = /^\/?((?!\.(js|css|map|json|png|jpg|jpeg|gif|svg|eot|woff2|ttf|ico)).)*$/;
    app.get(pattern, async (req, res) => {
      if (serverReady) {
        serverRender(res, req, api);
      } else {
        httpResponseQueue.push([req, res]);
      }
    });
  });
}

function serverRender(res, req, api) {
  const {
    context: {
      userConfig: { outputDir, web = {} },
      rootDir,
    },
    getValue,
  } = api;
  const outputPath = path.join(rootDir, outputDir);
  let pathname = req.path;
  const staticConfig = getValue(STATIC_CONFIG);
  if (!web.mpa) {
    if (!staticConfig.routes.find(({ path: routePath }) => routePath === pathname)) {
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.send('Cannot find target page.');
      return;
    }
    pathname = 'index';
  }
  const nodeFilePath = path.join(outputPath, NODE, `${pathname.replace(/\.html$/, '')}.js`);
  if (fs.existsSync(nodeFilePath)) {
    const bundleContent = fs.readFileSync(nodeFilePath, 'utf-8');
    const mod = exec(bundleContent, nodeFilePath);
    const htmlFilePath = path.join(outputPath, WEB, /\.html$/.test(pathname) ? pathname : `${pathname}.html`);
    const htmlTemplate = fs.readFileSync(htmlFilePath, 'utf-8');
    mod.render({ req, res }, { htmlTemplate });
  }
}

function exec(code, filePath) {
  const module: any = new Module(filePath, this);
  module.paths = (Module as any)._nodeModulePaths(filePath);
  module.filename = filePath;
  module._compile(code, filePath);
  return module.exports;
}
