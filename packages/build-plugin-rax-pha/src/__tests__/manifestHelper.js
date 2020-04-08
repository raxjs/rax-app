'use strict';

import manifestHelpers from '../manifestHelpers';

const { transformAppConfig, getPageManifestByPath } = manifestHelpers;

describe('transformAppConfig', () => {
  it('should transform dataPrefetches', () => {
    const manifestJSON = transformAppConfig({
      dataPrefetches: [{
        url: '/a.com',
        data: {
          id: 123
        }
      }]
    }, true);
    expect(manifestJSON.data_prefetches.length).toBe(1);
    expect(manifestJSON.data_prefetches[0].data).toMatchObject({
      id: 123
    });
  });

  it('should transform window to flat object', () => {
    const manifestJSON = transformAppConfig({
      window: {
        title: '',
        backgroundColor: '',
        pullRefresh: true
      }
    }, true);
    expect(manifestJSON).toMatchObject({ title: '', background_color: '', pull_refresh: true });
  });

  it('should transform tabBar to tab_bar', () => {
    const manifestJSON = transformAppConfig({
      tabBar: {
        textColor: '',
        selectedColor: '',
        backgroundColor: '',
        items: [{
          path: 'tab1',
          name: '主会场',
          icon: '',
          activeIcon: ''
        }]
      }
    }, true);

    expect(manifestJSON.tab_bar).toBeTruthy();
    expect(manifestJSON.tab_bar.items[0]).toMatchObject({ path: 'tab1', name: '主会场', icon: '', active_icon: '' });
  });

  it('should transform routes to pages', () => {
    const manifestJSON = transformAppConfig({
      routes: [
        {
          path: '/',
          name: 'home',
          source: 'pages/Home/index',
          dataPrefetches: [{
            url: '/a.com',
            data: {
              id: 123
            }
          }]
        },
        {
          path: '/home1',
          name: 'home1',
          source: 'pages/Home1/index'
        }
      ]
    }, true);
    expect(manifestJSON.pages.length).toBe(2);
    expect(manifestJSON.pages[0].data_prefetches).toMatchObject([{ url: '/a.com', data: { id: 123 } }]);
  });
});
