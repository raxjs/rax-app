import * as path from 'path';
import { start } from '@alib/build-scripts';
import * as getPort from 'get-port';
import Browser, { IPage } from './browser';
import getBuiltInPlugins = require('../../packages/rax-app/src');
import executeCommand from './executeCommand';

interface ISetupBrowser {
  (options: { port: number; defaultHtml?: string }): Promise<IReturn>;
}

interface IReturn {
  page: IPage;
  browser: Browser;
}

// get builtIn plugins
export const startFixture = async function (example: string) {
  const port = await getPort();
  const rootDir = path.join(__dirname, `../../examples/${example}`);
  executeCommand('rm -rf node_modules', rootDir);
  executeCommand('npm install --registry=https://registry.npm.taobao.org/', rootDir);
  const devServer = await start({
    args: {
      config: path.join(__dirname, 'build-mpa.json'),
      port,
      disableOpen: true
    },
    rootDir,
    getBuiltInPlugins: (userConfig) => {
      return getBuiltInPlugins(userConfig).concat(require.resolve('./test-plugin'));
    },
  });
  return {
    port,
    devServer
  };
};

export const setupBrowser: ISetupBrowser = async (options) => {
  const { port, defaultHtml = 'index.html' } = options;
  const browser = new Browser();
  await browser.start();
  const page = await browser.page(`http://127.0.0.1:${port}/${defaultHtml}`);
  return {
    browser,
    page,
  };
};
