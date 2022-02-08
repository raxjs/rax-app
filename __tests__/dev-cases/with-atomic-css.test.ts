import { startFixture, setupBrowser } from '../utils/start';
import { IPage } from '../utils/browser';

const example = 'with-atomic-css';
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
    expect(await page.$$text('#link')).toStrictEqual(['Go About']);
    const [linkElement] = await page.$$('#link');
    const computedStyle = await page.evaluate((element) => {
      const style = window.getComputedStyle(element);
      const result = {};
      Object.values(style).forEach((property) => {
        result[property] = style.getPropertyValue(property);
      });
      return result;
    }, linkElement);
    expect(computedStyle['background-color']).toStrictEqual('rgb(59, 130, 246)');
    await page.click('#link');
    await page.waitForFunction(`document.getElementsByClassName('about').length > 0`);
  }, 120000);
});

afterAll(async () => {
  await browser?.close?.();
  await devServer?.close();
});
