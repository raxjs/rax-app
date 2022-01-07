import * as path from 'path';
import * as fs from 'fs-extra';
import { buildFixture, setupBrowser } from '../utils/build';
import { IPage } from '../utils/browser';

const example = 'with-rax-mpa';
let page: IPage = null;
let browser = null;

buildFixture(example);

describe('should build web result: ', () => {
  test('open /home', async () => {
    const res = await setupBrowser({ example, defaultHtml: 'home.html' });
    page = res.page;
    browser = res.browser;
    await page.waitForFunction(`document.getElementsByTagName('span').length > 0`);
    expect(await page.$$text('.title')).toStrictEqual(['Welcome to Your Rax App']);
    const jsBundlePath = path.join(process.cwd(), 'examples', example, 'build/web/home.js');
    const { size } = fs.statSync(jsBundlePath);
    expect(size / 1024 < 200).toBeTruthy();
  });

  test('open /about', async () => {
    const res = await setupBrowser({ example, defaultHtml: 'about.html' });
    page = res.page;
    browser = res.browser;
    await page.waitForFunction(`document.getElementsByTagName('span').length > 0`);
    expect(await page.$$text('.title')).toStrictEqual(['About Page']);
  });

  test('open /profile', async () => {
    const res = await setupBrowser({ example, defaultHtml: 'about.html' });
    page = res.page;
    browser = res.browser;
    await page.push('/profile.html');
    await page.waitForFunction(`document.getElementsByTagName('span').length > 0`);
    expect(await page.$$text('.title')).toStrictEqual(['Profile Page']);
  });
});

describe('should build weex result: ', () => {
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

describe('should build kraken result: ', () => {
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
