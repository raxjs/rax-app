import * as Module from 'module';
import * as fs from 'fs-extra';
import * as path from 'path';
import { NODE, WEB } from '../constants';

export default function (api, config) {
  let serverReady = false;
  let httpResponseQueue = [];
  const {
    context: {
      userConfig: { outputDir },
      rootDir,
    },
  } = api;
  const outputPath = path.resolve(rootDir, outputDir);
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
        console.log('compilerDoneCount', compilerDoneCount);
        console.log('server.compiler.compilers.length', server.compiler.compilers.length);
        // wait until all compiler is done
        if (compilerDoneCount === server.compiler.compilers.length) {
          serverReady = true;
          httpResponseQueue.forEach(([req, res]) => {
            serverRender(res, req, outputPath);
          });
          // empty httpResponseQueue
          httpResponseQueue = [];
        }
      });
    });

    const pattern = /^\/?((?!\.(js|css|map|json|png|jpg|jpeg|gif|svg|eot|woff2|ttf|ico)).)*$/;
    app.get(pattern, async (req, res) => {
      if (serverReady) {
        serverRender(res, req, outputPath);
      } else {
        httpResponseQueue.push([req, res]);
      }
    });
  });
}

function serverRender(res, req, outputPath) {
  const nodeFilePath = path.join(outputPath, NODE, `${req.url.replace('.html', '')}.js`);
  const htmlFilePath = path.join(outputPath, WEB, /\.html$/.test(req.url) ? req.url : `${req.url}.html`);
  const bundleContent = fs.readFileSync(nodeFilePath, 'utf-8');
  const htmlTpl = fs.readFileSync(htmlFilePath, 'utf-8');
  const mod = exec(bundleContent, nodeFilePath);
  mod.render(req, res, htmlTpl);
}

function exec(code, filePath) {
  const module: any = new Module(filePath, this);
  module.paths = (Module as any)._nodeModulePaths(filePath);
  module.filename = filePath;
  module._compile(code, filePath);
  return module.exports;
}
