import * as path from 'path';
import * as fs from 'fs-extra';
import { startFixture, setupBrowser } from '../utils/start';
import { IPage } from '../utils/browser';

const example = 'basic-spa';
let page: IPage = null;
let browser = null;
let devServer = null;


describe('should start web devServer: ', () => {
  test('open /', async () => {
    const serverOptions = await startFixture(example);
    const port = serverOptions.port;
    devServer = serverOptions.devServer;
    const res = await setupBrowser({ port, defaultHtml: '' });
    page = res.page;
    browser = res.browser;
    await page.waitForFunction(`document.getElementsByTagName('span').length > 0`);
    expect(await page.$$text('.title')).toStrictEqual(['Welcome to Your Rax App']);
    await page.click('#link');
    await page.waitForFunction(`document.getElementsByClassName('about').length > 0`);
  }, 120000);
});

describe('should build weex result: ', () => {
  test('js bundle', async () => {
    const bundlePath = path.join(process.cwd(), `examples/${example}/build/weex/index.js`);
    const existsBundle = fs.existsSync(bundlePath);
    expect(existsBundle).toBe(true);
    if (existsBundle) {
      const bundleContent = fs.readFileSync(bundlePath, 'utf-8');
      expect(bundleContent).toContain('// {"framework" : "Rax"}');
    }
  })
});

describe('should build kraken result: ', () => {
  test('js bundle', async () => {
    const bundlePath = path.join(process.cwd(), `examples/${example}/build/kraken/index.js`);
    const existsBundle = fs.existsSync(bundlePath);
    expect(existsBundle).toBe(true);
  });
});

describe(`should build miniapp result: `, () => {
  const outputPath = path.join(process.cwd(), `examples/${example}/build/miniapp`);

  test('js bundle', async () => {
    const existsBundle = fs.existsSync(path.join(outputPath, 'bundle.js'));
    expect(existsBundle).toBe(true);
  });

  test('app json content', async () => {
    const appJSONPath = path.join(outputPath, 'app.json');
    const existsAppJSONPath = fs.existsSync(appJSONPath);
    expect(existsAppJSONPath).toBe(true);
    if (existsAppJSONPath) {
      expect(fs.readJsonSync(appJSONPath)).toStrictEqual(
        {
          "pages": ["pages/Home/index", "pages/About/index"],
          "window": {"defaultTitle": "Rax App"},
          "tabBar": {
            "textColor": "#dddddd",
            "selectedColor": "#49a9ee",
            "backgroundColor": "#ffffff",
            "items": [
              {
                "pagePath": "pages/Home/index",
                "name": "Home Page",
              },
              {
                "pagePath": "pages/About/index",
                "name": "About",
              }
            ]
          }
        }
      );
    }
  });
});

describe(`should build wechat-miniprogram result: `, () => {
  const outputPath = path.join(process.cwd(), `examples/${example}/build/wechat-miniprogram`);

  test('js bundle', async () => {
    const existsBundle = fs.existsSync(path.join(outputPath, 'bundle.js'));
    expect(existsBundle).toBe(true);
  });

  test('app json content', async () => {
    const appJSONPath = path.join(outputPath, 'app.json');
    const existsAppJSONPath = fs.existsSync(appJSONPath);
    expect(existsAppJSONPath).toBe(true);
    if (existsAppJSONPath) {
      expect(fs.readJsonSync(appJSONPath)).toStrictEqual({
        "pages": ["pages/Home/index", "pages/About/index"],
        "window": {"navigationBarTitleText": "Rax App"},
        "tabBar": {
          "color": "#dddddd",
          "selectedColor": "#49a9ee",
          "backgroundColor": "#ffffff",
          "list": [
            {
              "pagePath": "pages/Home/index",
              "text": "Home Page",
            },
            {
              "pagePath": "pages/About/index",
              "text": "About",
            }
          ]
        }
      });
    }
  });
});

afterAll(async () => {
  await browser?.close?.();
  await devServer.close();
});
