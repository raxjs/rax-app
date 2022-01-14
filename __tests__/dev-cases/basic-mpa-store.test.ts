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
    expect(await page.$$text('#count')).toStrictEqual(['Home Count: 0']);
    await page.click('#count');
    expect(await page.$$text('#count')).toStrictEqual(['Home Count: 1']);
  }, 120000);

  test('open /about', async () => {
    await page.push('/about.html');
    await page.waitForFunction(`document.getElementsByTagName('span').length > 0`);
    expect(await page.$$text('.title')).toStrictEqual(['About Page']);
    expect(await page.$$text('#count')).toStrictEqual(['About Count: 0']);
    await page.click('#count');
    expect(await page.$$text('#count')).toStrictEqual(['About Count: 1']);
  });

   test('open /detail', async () => {
    await page.push('/detail.html');
    await page.waitForFunction(`document.getElementsByTagName('div').length > 0`);
    expect(await page.$$text('div')).toContain('Detail Page');
  });
});

afterAll(async () => {
  await browser?.close();
  await devServer?.close();
});

