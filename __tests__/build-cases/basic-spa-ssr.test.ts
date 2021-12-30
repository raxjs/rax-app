import * as path from 'path';
import * as cheerio from 'cheerio';
import { buildFixture } from '../utils/build';

const example = 'basic-spa-ssr';
const BUNDLE_URL = require.resolve(path.join(process.cwd(), `examples/${example}/build/node/index.js`));

describe('should build web result: ', () => {
  buildFixture(example);

  test('ssr render method', async () => {
    const { render } = require(BUNDLE_URL);
    const ctxReq = {
      url: '/?a=1',
      path: '/',
    };

    let html;
    const ctxRes = {
      setHeader() {},
      send(result) {
        html = result;
      },
    };
    const ctx = { req: ctxReq, res: ctxRes };
    await render(ctx);
    const $ = cheerio.load(html, { decodeEntities: false });
    expect($('.title').text()).toBe('Welcome to Your Rax App with SSR');
  });
});
