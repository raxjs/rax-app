

const { transformAppConfig, setRealUrlToManifest } = require('../manifestHelpers');
const cloneDeep = require('lodash.clonedeep');

describe('transformAppConfig', () => {
  it('should transform document fields', () => {
    const manifestJSON = transformAppConfig({
      spm: 'A-123',
      metas: [
        '<meta name=\"apple-mobile-web-app-status-bar-style\" content=\"black\" />'
      ],
      links: [
        '<link rel=\"dns-prefetch\" href=\"//g.alicdn.com\" />'
      ],
      scripts: [
        '<script defer src=\"xxx/index.js\"></script>'
      ],
      'offlineResources': ["//g.alicdn.com/.*"]
    }, true);
    expect(manifestJSON.spm).toBe('A-123');
    expect(manifestJSON.metas[0]).toBe('<meta name=\"apple-mobile-web-app-status-bar-style\" content=\"black\" />');
    expect(manifestJSON.links[0]).toBe('<link rel=\"dns-prefetch\" href=\"//g.alicdn.com\" />');
    expect(manifestJSON.scripts[0]).toBe('<script defer src=\"xxx/index.js\"></script>');
    expect(manifestJSON.offline_resources[0]).toBe('//g.alicdn.com/.*');
  });

  it('should transform dataPrefetch', () => {
    const manifestJSON = transformAppConfig({
      dataPrefetch: [{
        url: '/a.com',
        data: {
          id: 123,
          taskId: 233,
          cId: {
            dId: true
          }
        },
        header: {
          taskId: 455
        }
      }],
    }, true);
    expect(manifestJSON.data_prefetch.length).toBe(1);
    expect(manifestJSON.data_prefetch[0].data).toMatchObject({
      id: 123,
      taskId: 233,
      cId: {
        dId: true
      }
    });
    expect(manifestJSON.data_prefetch[0].header).toMatchObject({
      taskId: 455,
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
          dataPrefetch: [{
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
    expect(manifestJSON.pages[0].data_prefetch).toMatchObject([{
      url: '/a.com',
      data: {
        id: 123
      },
      header: {}
    }]);
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
        data_prefetch: [{
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
});

describe('setRealUrlToManifest', () => {
  const config = {
    pages: [
      {
        path: '/',
        name: 'home3',
        source: 'pages/Home/index',
        data_prefetch: [{
          url: '/a.com',
          data: {
            id: 123,
          },
        }],
      },
      {
        tab_header: {
          source: 'pages/Header/index'
        },
        path: '/home1',
        source: 'pages/Home1/index',
      },
      {
        frames: [{
          path: '/frame1',
          source: 'pages/frame1/index',
        }]
      }
    ],
    tab_bar: {
      source: 'pages/TabBar/index',
    }
  };
  const options = {
    urlPrefix: 'https://abc.com/',
    cdnPrefix: 'https://cdn.com/',
    isTemplate: true,
    inlineStyle: false,
    api: {
      applyMethod: () => {
        return {};
      }
    },
  };

  it('should change real url to manifest', () => {
    const manifest = setRealUrlToManifest(options, cloneDeep(config));

    expect(manifest.pages[0].path).toBe('https://abc.com/home3');
    expect(manifest.pages[0].key).toBe('home3');
    expect(manifest.pages[0].script).toBe('https://cdn.com/home3.js');
    expect(manifest.pages[0].stylesheet).toBe('https://cdn.com/home3.css');
    expect(manifest.pages[1].path).toBe('https://abc.com/home1');
    expect(manifest.pages[2].frames[0].path).toBe('https://abc.com/frame1');
    expect(manifest.pages[1].tab_header.url).toBe('https://abc.com/header');
    expect(manifest.tab_bar.url).toBe('https://abc.com/tabbar');
  });

  it('should set document to manifest', () => {
    const manifest = setRealUrlToManifest({
      ...options,
      api: {
        applyMethod: () => {
          return {
            custom: true,
            document: '<html>123</html>'
          };
        }
      },
    }, cloneDeep(config));

    expect(manifest.pages[0].document).toBe('<html>123</html>');
    expect(manifest.pages[1].document).toBe('<html>123</html>');
    expect(manifest.pages[2].frames[0].document).toBe('<html>123</html>');
  });

  it('should not add stylesheet to page', () => {
    const manifest = setRealUrlToManifest({
      ...options,
      inlineStyle: true,
    }, cloneDeep(config));

    expect(manifest.pages[0].stylesheet).toBeUndefined();
  });

  it('should not support template', () => {
    const manifest = setRealUrlToManifest({
      ...options,
      isTemplate: false,
    }, cloneDeep(config));

    expect(manifest.pages[0].script).toBeUndefined();
    expect(manifest.pages[0].stylesheet).toBeUndefined();
    expect(manifest.pages[0].document).toBeUndefined();
  });
});
