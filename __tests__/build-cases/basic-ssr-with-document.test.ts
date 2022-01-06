import * as path from 'path';
import * as cheerio from 'cheerio';
import { buildFixture } from '../utils/build';

const example = 'basic-ssr-with-document';

describe('should build web result: ', () => {
  beforeEach(() => {
    // Reset all require cache
    jest.resetModules()
  });

  buildFixture(example);

  test('renderPageOnly', async () => {
    const BUNDLE_URL = path.join(process.cwd(), `examples/${example}/build/node/home.js`);
    const { renderPageOnly } = require(BUNDLE_URL);

    const ctxReq = {
      url: '/?a=1',
      path: '/',
    };
    const ctx = { req: ctxReq };

    const { html } = await renderPageOnly(ctx);
    const $ = cheerio.load(html, { decodeEntities: false });
    expect($('#title').text()).toBe('Welcome to Your Rax App with SSR');
  });

  test('renderPageOnly with initialProps', async () => {
    const BUNDLE_URL = path.join(process.cwd(), `examples/${example}/build/node/home.js`);
    const { renderPageOnly } = require(BUNDLE_URL);

    const ctxReq = {
      url: '/?a=1',
      path: '/',
    };
    const ctx = { req: ctxReq };

    const { html } = await renderPageOnly(ctx, { 
      initialProps: {
        data: {
          title: 'Welcome to Your Rax App with SSR!',
        },
      }
    });

    const $ = cheerio.load(html, { decodeEntities: false });
    expect($('#title').text()).toBe('Welcome to Your Rax App with SSR!');
  });

  test('renderDocumentOnly', async () => {
    const BUNDLE_URL = path.join(process.cwd(), `examples/${example}/build/node/home.js`);
    const { renderDocumentOnly } = require(BUNDLE_URL);

    const ctxReq = {
      url: '/?a=1',
      path: '/',
    };
    const ctx = { req: ctxReq };

    const { html } = await renderDocumentOnly(ctx);
    const $ = cheerio.load(html, { decodeEntities: false });

    expect($('#root').text()).toBe('');
    expect($('#star').text()).toBe('10000');
  });

  test('renderDocumentOnly with initialProps', async () => {
    const BUNDLE_URL = path.join(process.cwd(), `examples/${example}/build/node/home.js`);
    const { renderDocumentOnly } = require(BUNDLE_URL);

    const ctxReq = {
      url: '/?a=1',
      path: '/',
    };
    const ctx = { req: ctxReq };

    const { html } = await renderDocumentOnly(ctx, { 
      initialProps: {
        data: {
          stars: 20000
        },
      }
    });

    const $ = cheerio.load(html, { decodeEntities: false });

    expect($('#root').text()).toBe('');
    expect($('#star').text()).toBe('20000');
  });
});
