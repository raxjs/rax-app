import { buildFixture, setupBrowser } from '../utils/build';
import { IPage } from '../utils/browser';

const example = 'spa-keep-alive';
let page: IPage = null;
let browser = null;

buildFixture(example);

describe('should build web result: ', () => {
  test('open /', async () => {
    const res = await setupBrowser({ example });
    page = res.page;
    browser = res.browser;
    await page.waitForFunction(`document.getElementsByTagName('img').length > 0`);
    expect(await page.$$text('.title')).toStrictEqual(['Welcome to Your Rax App']);
    await page.click('#link');
    await page.waitForFunction(`document.getElementsByClassName('about').length > 0`);
  });
});

afterAll(async () => {
  await browser.close();
});
