/* eslint-disable new-cap */
/* global APINamespace,TARGET, Page,init */
/* eslint-disable module/no-implicit-dependencies */
const render = require('miniapp-render');
const config = require('/* CONFIG_PATH */');

/* INIT_FUNCTION */
Page({
  data: {
    pageId: '',
    bodyClass: 'h5-body miniprogram-root'
  },
  onLoad(query) {
    const pageInstance = render.createPage(this.route, config);
    this.pageId = pageInstance.pageId;
    this.window = pageInstance.window;
    this.document = pageInstance.document;
    this.query = query;

    // Handle update of body
    this.document.documentElement.addEventListener('$$childNodesUpdate', () => {
      const domNode = this.document.body;
      const data = {
        bodyClass: `${domNode.className || ''} h5-body miniprogram-root`
      };

      if (data.bodyClass !== this.data.bodyClass) {
        this.setData(data);
      }
    });

    // Hadle selectorQuery
    this.window.$$createSelectorQuery = () =>
      APINamespace.createSelectorQuery().in(this);

    // Handle intersectionObserver
    this.window.$$createIntersectionObserver = options => {
      if (TARGET === 'miniapp') {
        /* eslint-disable  no-undef */
        my.createIntersectionObserver(options);
      } else {
        /* eslint-disable  no-undef */
        wx.createIntersectionObserver(this, options);
      }
    };

    init(this.window, this.document);
    this.setData({
      pageId: this.pageId
    });
    this.app = this.window.createApp();
    this.window.$$trigger('load');
    this.window.$$trigger('pageLoad', { event: query });
  },
  onShow() {
    this.window.$$trigger('pageShow');
  },
  onReady() {
    this.window.$$trigger('pageReady');
  },
  onHide() {
    this.window.$$trigger('pageHide');
  },
  onUnload() {
    this.window.$$trigger('beforeunload');
    this.window.$$trigger('pageUnload');
    if (this.app && this.app.$destroy) this.app.$destroy();
    this.document.body.$$recycle(); // Recycle DOM node

    render.destroyPage(this.pageId);

    this.pageId = null;
    this.window = null;
    this.document = null;
    this.app = null;
    this.query = null;
  },
  onShareAppMessage(data) {
    if (this.window.onShareAppMessage) {
      const shareOptions = this.window.onShareAppMessage(data);
      const query = Object.assign({}, this.query || {});

      if (shareOptions.path) {
        query.targeturl = encodeURIComponent(shareOptions.path);
      }

      query.type = 'share';
      const queryString = Object.keys(query)
        .map(key => `${key}=${query[key] || ''}`)
        .join('&');
      const currentPagePath = `${this.route}?${queryString}`;
      shareOptions.path = currentPagePath;

      return shareOptions;
    }
  }
  /* PAGE_SCROLL_FUNCTION */
  /* REACH_BOTTOM_FUNCTION */
  /* PULL_DOWN_REFRESH_FUNCTION */
});
