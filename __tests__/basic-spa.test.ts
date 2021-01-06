import { buildFixture, setupBrowser } from './utils/build';
import { IPage } from './utils/browser';

const example = 'basic-spa';
let page: IPage = null;
let browser = null;

buildFixture(example);

test('open /', async () => {
  const res = await setupBrowser({ example });
  page = res.page;
  browser = res.page;
  await page.waitForFunction(`document.getElementsByTagName('span').length > 0`)
  expect(await page.$$text('.title')).toStrictEqual(['Welcome to Your Rax App']);
});

afterAll(async () => {
  await browser.close();
});
