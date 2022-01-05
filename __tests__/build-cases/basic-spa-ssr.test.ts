import * as path from 'path';
import * as cheerio from 'cheerio';
import { buildFixture } from '../utils/build';

const example = 'basic-spa-ssr';

describe('should build web result: ', () => {
  beforeEach(() => {
    // Reset all require cache
    jest.resetModules()
  });

  buildFixture(example);

  test('ssr render method', async () => {
    const { render } = require(path.join(process.cwd(), `examples/${example}/build/node/index.js`));
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

  test('ssr renderToHTML method', async () => {
    const { renderToHTML } = require(path.join(process.cwd(), `examples/${example}/build/node/index.js`));
    const req = {
      url: '/?a=1',
      path: '/',
    };

    const res = {};
    const html  = await renderToHTML(req, res);
    const $ = cheerio.load(html, { decodeEntities: false });
    expect($('.title').text()).toBe('Welcome to Your Rax App with SSR');
  });
});
