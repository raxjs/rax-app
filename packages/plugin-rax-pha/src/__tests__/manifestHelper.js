

const { transformAppConfig, getPageManifestByPath } = require('../manifestHelpers')

describe('transformAppConfig', () => {
  it('should transform dataPrefetches', () => {
    const manifestJSON = transformAppConfig({
      dataPrefetches: [{
        url: '/a.com',
        data: {
          id: 123,
        },
      }],
    }, true);
    expect(manifestJSON.data_prefetches.length).toBe(1);
    expect(manifestJSON.data_prefetches[0].data).toMatchObject({
      id: 123,
    });
  });

  it('should transform window to flat object', () => {
    const manifestJSON = transformAppConfig({
      window: {
        title: '',
        backgroundColor: '',
        pullRefresh: true,
      },
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
          activeIcon: '',
        }],
      },
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
              id: 123,
            },
          }],
        },
        {
          path: '/home1',
          name: 'home1',
          source: 'pages/Home1/index',
        },
      ],
    }, true);
    expect(manifestJSON.pages.length).toBe(2);
    expect(manifestJSON.pages[0].data_prefetches).toMatchObject([{ url: '/a.com', data: { id: 123 } }]);
  });

  it('should not filter whitelist fields', () => {
    const manifestJSON = transformAppConfig({
      a: 123,
    }, false);

    expect(manifestJSON).toMatchObject({ a: 123 });
  });
});

describe('getPageManifestByPath', () => {
  const config = {
    pages: [
      {
        path: '/',
        name: 'home',
        source: 'pages/Home/index',
        data_prefetches: [{
          url: '/a.com',
          data: {
            id: 123,
          },
        }],
      },
      {
        path: '/home1',
        name: 'home1',
        source: 'pages/Home1/index',
      },
    ],
  };

  it('should get empty object when no path', () => {
    const manifest = getPageManifestByPath({});

    expect(manifest).toMatchObject({});
  });

  it('should get first page manifest', () => {
    const manifest = getPageManifestByPath({
      decamelizeAppConfig: config,
    });

    expect(manifest).toMatchObject({
      path: '/',
      name: 'home',
      data_prefetches: [
        { url: '/a.com', data: { id: 123 } },
      ],
    });
  });

  it('should generate nsr script', () => {
    const manifest = getPageManifestByPath({
      decamelizeAppConfig: config,
      nsr: true,
    });

    expect(manifest.nsr_script).toBe('/web/index.nsr.js');
  });

  it('should delete fields when frame page', () => {
    const copyConfig = { ...config };
    copyConfig.pages[0].frame = true;
    copyConfig.pages[0].tab_bar = {
      background_color: '#ff0000',
    };

    const manifest = getPageManifestByPath({
      decamelizeAppConfig: copyConfig,
    });

    expect(manifest.pages.length).toBe(2);
    expect(manifest.tab_bar).toMatchObject({ background_color: '#ff0000' });
  });

  it('should get second page', () => {
    const manifest = getPageManifestByPath({
      decamelizeAppConfig: config,
      path: '/home1',
      nsr: true,
    });

    expect(manifest.nsr_script).toBe('/web/home1/index.nsr.js');
  });
});
