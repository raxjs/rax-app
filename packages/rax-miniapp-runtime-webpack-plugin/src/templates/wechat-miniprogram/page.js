/* eslint-disable new-cap */
/* global Page, init */
/* eslint-disable module/no-implicit-dependencies */
const render = require('miniapp-render');
const config = require('/* CONFIG_PATH */');

const { createPage, destroyPage, $$adapter } = render;
const events = {};

[
  'onReachBottom',
  'onTabItemTap',
  'onResize',
  'onPageScroll'
].forEach(eventName => {
  events[eventName] = function(event) {
    if (this.window) {
      this.window.$$trigger(eventName, { event });
    }
  };
});

/* INIT_FUNCTION */
Page({
  data: {
    pageId: '',
    bodyClass: 'miniprogram-root'
  },
  onLoad(query) {
    this.pageId = `p-${$$adapter.tool.getId()}-/${this.route}`;
    const { window, document } = createPage(this.pageId, config);
    this.window = window;
    this.document = document;
    this.query = query;

    // Set __pageId to global window object
    this.window.__pageId = this.pageId;
    // Remove rax inited flag
    this.window.__RAX_INITIALISED__ = false;

    // Handle update of body
    this.document.documentElement.addEventListener('$$childNodesUpdate', () => {
      const domNode = this.document.body;
      const data = {
        bodyClass: `${domNode.className || ''} miniprogram-root`
      };

      if (data.bodyClass !== this.data.bodyClass) {
        this.setData(data);
      }
    });

    init(this.window, this.document);
    this.setData({
      pageId: this.pageId
    });
    this.app = this.window.createApp();
    this.window.$$trigger('load');
    this.window.$$trigger('pageload', { event: query });
  },
  onShow() {
    this.window.$$trigger('pageshow');
    // compatible with original name
    this.window.$$trigger('onShow');
  },
  onReady() {
    this.window.$$trigger('pageready');
  },
  onHide() {
    this.window.$$trigger('pagehide');
    // compatible with original name
    this.window.$$trigger('onHide');
  },
  onUnload() {
    this.window.$$trigger('beforeunload');
    this.window.$$trigger('pageunload');
    if (this.app && this.app.$destroy) this.app.$destroy();
    this.document.body.$$recycle(); // Recycle DOM node

    destroyPage(this.pageId);

    this.pageId = null;
    this.window = null;
    this.document = null;
    this.app = null;
    this.query = null;
  },
  onShareAppMessage(options) {
    if (this.window) {
      const shareInfo = {};
      // share app message only can be listened once
      this.window.$$trigger('onShareAppMessage', {
        event: { options, shareInfo }
      });
      return shareInfo.content;
    }
  },
  ...events,
  /* PULL_DOWN_REFRESH_FUNCTION */
});
