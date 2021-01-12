import * as path from 'path';
import { build } from '@alib/build-scripts';
import * as getPort from 'get-port';
import Browser, { IPage } from './browser';
import getBuiltInPlugins = require('../../packages/rax-app/src');
import executeCommand from './executeCommand';

interface ISetupBrowser {
  (options: {
    example: string;
    outputDir?: string;
    defaultHtml?: string;
  }): Promise<IReturn>;
}

interface IReturn {
  page: IPage;
  browser: Browser;
}

// get builtIn plugins
export const buildFixture = function(example: string) {
  test(`setup ${example}`, async () => {
    const rootDir = path.join(__dirname, `../../examples/${example}`);
    executeCommand('rm -rf node_modules', rootDir);
    executeCommand('npm install --registry=https://registry.npm.taobao.org/', rootDir);
    await build({
      args: {
        config: path.join(rootDir, 'build.json'),
      },
      rootDir,
      getBuiltInPlugins: (userConfig) => {
        return getBuiltInPlugins(userConfig).concat(require.resolve('./test-plugin'));
      },
    });
  }, 120000);
}

export const setupBrowser: ISetupBrowser = async (options) => {
  const { example, outputDir = 'build', defaultHtml = 'index.html' } = options;
  const rootDir = path.join(__dirname, `../../examples/${example}`);
  const port = await getPort();
  const browser = new Browser({
    cwd: path.join(rootDir, outputDir, 'web'),
    port,
  });
  await browser.start();
  const page = await browser.page(`http://127.0.0.1:${port}/${defaultHtml}`);
  return {
    browser,
    page,
  }
}
