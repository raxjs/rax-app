import * as path from 'path';
import * as cheerio from 'cheerio';
import { buildFixture } from '../utils/build';

const example = 'basic-ssr';

describe('should build web result: ', () => {
  beforeEach(() => {
    // Reset all require cache
    jest.resetModules()
  });

  buildFixture(example);

  test('renderPageToHtml', async () => {
    const BUNDLE_URL = path.join(process.cwd(), `examples/${example}/build/node/home.js`);
    const { renderPageToHtml } = require(BUNDLE_URL);

    const ctxReq = {
      url: '/?a=1',
      path: '/',
    };

    const ctx = { req: ctxReq };

    const html = await renderPageToHtml(ctx);

    const $ = cheerio.load(html, { decodeEntities: false });
    expect($('#title').text()).toBe('Welcome to Your Rax App with SSR');
  });

  test('renderPageToHtml with initialProps', async () => {
    const BUNDLE_URL = path.join(process.cwd(), `examples/${example}/build/node/home.js`);
    const { renderPageToHtml } = require(BUNDLE_URL);

    const ctxReq = {
      url: '/?a=1',
      path: '/',
    };

    const ctx = { req: ctxReq };

    const html = await renderPageToHtml(ctx, { 
      initialProps: {
        data: {
          title: 'Welcome to Your Rax App with SSR!',
        },
      }
    });

    const $ = cheerio.load(html, { decodeEntities: false });
    expect($('#title').text()).toBe('Welcome to Your Rax App with SSR!');
  });

  test('renderDocumentToHtml with initialProps', async () => {
    const BUNDLE_URL = path.join(process.cwd(), `examples/${example}/build/node/home.js`);
    const { renderDocumentToHtml } = require(BUNDLE_URL);

    const ctxReq = {
      url: '/?a=1',
      path: '/',
    };

    const ctx = { req: ctxReq };

    const html = await renderDocumentToHtml(ctx, { 
      initialProps: {
        data: {
          title: 'Welcome to Your Rax App with SSR!',
        },
      }
    });

    const $ = cheerio.load(html, { decodeEntities: false });
    expect($('#root').text()).toBe('');
  });
});
