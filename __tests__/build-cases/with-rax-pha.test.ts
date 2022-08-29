import * as path from 'path';
import * as fs from 'fs-extra';
import { buildFixture } from '../utils/build';

const example = 'with-rax-pha';

buildFixture(example, true);

describe('should build manifest.json: ', () => {
  test('manifest.json content', async () => {

    console.log(123)
    const manifestJSON = fs.readJSONSync(path.join(process.cwd(), 'examples', example, 'build/web/manifest.json'));
    console.log('manifestJSON=', manifestJSON)
    expect(manifestJSON).toEqual({
      app_worker: { url: 'pha-worker.js' },
      links: [],
      metas: ['<meta name="release-info" content="version=12,app-id=123" />'],
      pages: [
        {
          frames: [
            { name: 'home', path: '/', source: 'pages/Home/index', title: 'home', url: 'https://m.taobao.com' },
            { name: 'about', path: '/about', source: 'pages/About/index' },
          ],
          tab_header: { height: 150, source: 'pages/Header/index' },
        },
        {
          name: 'about-single',
          path: '/about-single',
          source: 'pages/About-Single/index',
          url: 'https://m.taobao.com',
        },
      ],
      scripts: [
        '<script src="https://g.alicdn.com/mtb/lib-promise/3.1.3/polyfillB.js"  crossorigin="anonymous" ></script>',
      ],
      tab_bar: {
        custom: true,
        list: ['home', 'about-single'],
        source: '/components/CustomTabBar/index',
        html: '\n' +
          '  <!DOCTYPE html>\n' +
          '  <html>\n' +
          '    <head>\n' +
          '      <meta charset="utf-8" />\n' +
          '      \n' +
          '      <meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,minimum-scale=1,user-scalable=no,viewport-fit=cover" />\n' +
          '      <meta name="release-info" content="version=12,app-id=123" />\n' +
          '\n' +
          '      <title>PHA Demo</title>\n' +
          '      \n' +
          '      <link rel="stylesheet" href="/customtabbar.css" />\n' +
          '\n' +
          '    </head>\n' +
          '    <body >\n' +
          '      \n' +
          '      <div id="root"></div>\n' +
          '      <script src="https://g.alicdn.com/mtb/lib-promise/3.1.3/polyfillB.js"  crossorigin="anonymous" ></script>\n' +
          '\n' +
          '      \n' +
          '      <script crossorigin="anonymous" type="application/javascript" src="/customtabbar.js"></script>\n' +
          '\n' +
          '    </body>\n' +
          '  </html>\n'
      },
      title: 'PHA Demo',
    });
  });
});
