import { startFixture, setupBrowser } from '../utils/start';
import { IPage } from '../utils/browser';

const example = 'basic-ssr';
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
    expect(await page.$$text('#title')).toStrictEqual(['Welcome to Your Rax App with SSR']);
  }, 120000);

  test('open /about', async () => {
    await page.push('/about.html');
    expect(await page.$$text('.title')).toStrictEqual(['About Page']);
  })
});

afterAll(async () => {
  await browser?.close?.();
  await devServer?.close();
});

