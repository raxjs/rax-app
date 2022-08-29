import * as path from 'path';
import * as fs from 'fs-extra';
import { buildFixture } from '../utils/build';

const example = 'with-rax-pha';

buildFixture(example, true);

describe('should build manifest.json: ', () => {
  test('manifest.json content', async () => {
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
        html: "\n  <!DOCTYPE html>\n  <html>\n    <head>\n      <meta charset=\"utf-8\" />\n      \n      <meta name=\"viewport\" content=\"width=device-width,initial-scale=1,maximum-scale=1,minimum-scale=1,user-scalable=no,viewport-fit=cover\" />\n      <meta name=\"release-info\" content=\"version=12,app-id=123\" />\n<meta name=\"aplus-version\" content=\"aplus_wap\">\n\n      <title>PHA Demo</title>\n      \n      <link rel=\"stylesheet\" href=\"/customtabbar.css\" />\n\n    </head>\n    <body >\n      \n      <div id=\"root\"></div>\n      <script class=\"__combo_script__\" crossorigin=\"anonymous\" src=\"https://g.alicdn.com/??code/lib/rax/1.2.2/rax.min.umd.js,mtb/lib-promise/3.1.3/polyfillB.js,ali-lib/appear-polyfill/0.1.2/index.js,mtb/lib-windvane/3.0.7/windvane.js,mtb/lib-mtop/2.6.1/mtop.js,mtb/lib-login/2.2.0/login.js,jstracker/sdk-assests/5.1.25/index.js,ali-lib/aplus/0.2.0/index.js\"></script>\n<script src=\"https://g.alicdn.com/mtb/lib-promise/3.1.3/polyfillB.js\"  crossorigin=\"anonymous\" ></script>\n\n      \n      <script crossorigin=\"anonymous\" type=\"application/javascript\" src=\"/customtabbar.js\"></script>\n\n    </body>\n  </html>\n",
      },
      title: 'PHA Demo',
    });
  });
});
