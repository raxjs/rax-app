import * as path from 'path';
import * as fs from 'fs-extra';
import { startFixture, setupBrowser } from '../utils/start';
import { IPage } from '../utils/browser';

const example = 'basic-mpa-store';
let page: IPage = null;
let browser = null;
let devServer = null;

describe('should start web devServer: ', () => {
  test('open /home', async () => {
    const serverOptions = await startFixture(example);
    const port = serverOptions.port;
    devServer = serverOptions.devServer;
    const res = await setupBrowser({ port, defaultHtml: 'home.html' });
    page = res.page;
    browser = res.browser;
    await page.waitForFunction(`document.getElementsByTagName('span').length > 0`);
    expect(await page.$$text('.title')).toStrictEqual(['Welcome to Your Rax App']);
  }, 120000);

  test('open /about', async () => {
    const serverOptions = await startFixture(example);
    const port = serverOptions.port;
    devServer = serverOptions.devServer;
    const res = await setupBrowser({ port, defaultHtml: 'about.html' });
    page = res.page;
    browser = res.browser;
    await page.waitForFunction(`document.getElementsByTagName('span').length > 0`);
    expect(await page.$$text('.title')).toStrictEqual(['About Page']);
  }, 120000);
});


describe('should build weex: ', () => {
  test('home bundle', async () => {
    const bundlePath = path.join(process.cwd(), `examples/${example}/build/weex/home.js`);
    const existsBundle = fs.existsSync(bundlePath);
    expect(existsBundle).toBe(true);
    if (existsBundle) {
      const bundleContent = fs.readFileSync(bundlePath, 'utf-8');
      expect(bundleContent).toContain('// {"framework" : "Rax"}');
    }
  })

  test('about bundle', async () => {
    const bundlePath = path.join(process.cwd(), `examples/${example}/build/weex/about.js`);
    const existsBundle = fs.existsSync(bundlePath);
    expect(existsBundle).toBe(true);
    if (existsBundle) {
      const bundleContent = fs.readFileSync(bundlePath, 'utf-8');
      expect(bundleContent).toContain('// {"framework" : "Rax"}');
    }
  })
});

describe('should build kraken: ', () => {
  test('home bundle', async () => {
    const bundlePath = path.join(process.cwd(), `examples/${example}/build/kraken/home.js`);
    const existsBundle = fs.existsSync(bundlePath);
    expect(existsBundle).toBe(true);
  });

  test('about bundle', async () => {
    const bundlePath = path.join(process.cwd(), `examples/${example}/build/kraken/about.js`);
    const existsBundle = fs.existsSync(bundlePath);
    expect(existsBundle).toBe(true);
  });
});

afterAll(async () => {
  await browser.close();
});

