import * as Module from 'module';
import * as fs from 'fs-extra';
import * as path from 'path';
import * as url from 'url';
import { STATIC_CONFIG } from '../constants';
import { getChunkInfo } from '../utils/chunkInfo';

export default function (api, config) {
  let serverReady = false;
  let httpResponseQueue = [];

  config.devServer.inline(false);
  config.devServer.hot(false);
  // It will override all devServer before func, because ssr need hijack route
  config.devServer.set('before', (app, server) => {
    let compilerDoneCount = 0;
    server.compiler.compilers.forEach((compiler) => {
      compiler.hooks.done.tap('ssrServer', () => {
        compilerDoneCount++;
        // wait until all compiler is done
        if (compilerDoneCount === server.compiler.compilers.length) {
          serverReady = true;
          httpResponseQueue.forEach(([req, res, next, server]) => {
            render(res, req, next, server, api);
          });
          // empty httpResponseQueue
          httpResponseQueue = [];
        }
      });
    });

    const pattern = /^\/?((?!\.(js|css|map|json|png|jpg|jpeg|gif|svg|eot|woff2|ttf|ico)).)*$/;
    app.get(pattern, async (req, res, next) => {
      if (serverReady) {
        render(res, req, next, server, api);
      } else {
        httpResponseQueue.push([req, res, next, server]);
      }
    });
  });
}

function render(res, req, next, server, api) {
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

  if (req.path.endsWith('.html') && (typeof req.query.csr !== 'undefined')) {
    pathname = /\.html$/.test(pathname) ? pathname : `${pathname}.html`;
    const search = url.parse(req.url).search || '';
    req.url = pathname + search;
    return next();
  }
  
  const nodeCompiler = server.compiler.compilers
    .find(compiler => compiler.name === 'node');
  const webCompiler = server.compiler.compilers
    .find(compiler => compiler.name === 'web');
  const nodeFS = nodeCompiler.outputFileSystem;
  const webFS = webCompiler.outputFileSystem;

  const nodeFilePath = path.join(nodeCompiler.options.output.path, `${pathname.replace(/\.html$/, '')}.js`);
  if(nodeFS.existsSync(nodeFilePath)) {
    const bundleContent = nodeFS.readFileSync(nodeFilePath, 'utf-8');
    const mod = exec(bundleContent, nodeFilePath);
    const htmlFilePath = path.join(webCompiler.options.output.path, /\.html$/.test(pathname) ? pathname : `${pathname}.html`);
    const htmlTemplate = webFS.readFileSync(htmlFilePath, 'utf-8');
    mod.render({ req, res }, { htmlTemplate, chunkInfo: getChunkInfo() });
  }
}

function exec(code, filePath) {
  const module: any = new Module(filePath, this);
  module.paths = (Module as any)._nodeModulePaths(filePath);
  module.filename = filePath;
  module._compile(code, filePath);
  return module.exports;
}
