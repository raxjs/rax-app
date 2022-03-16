import { buildFixture, setupBrowser } from '../utils/build';
import { IPage } from '../utils/browser';

const example = 'basic-static-export';
let page: IPage = null;
let browser = null;
let devServer = null;

buildFixture(example)

describe('should start web devServer: ', () => {
  test('open /home', async () => {
    const res = await setupBrowser({ example, defaultHtml: 'home.html' });
    page = res.page;
    browser = res.browser;
    await page.waitForFunction(`document.getElementsByTagName('span').length > 0`);
    expect(await page.$$text('.title')).toStrictEqual(['Welcome to Your Rax App']);
  }, 120000);
});

afterAll(async () => {
  await browser?.close?.();
  await devServer?.close();
});

