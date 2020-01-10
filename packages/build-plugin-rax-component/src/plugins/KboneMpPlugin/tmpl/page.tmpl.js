/* global wx,Page,init */

const mp = require("miniapp-render");
const config = require("/* CONFIG_PATH */"); // eslint-disable-line

/* INIT_FUNCTION */

function dealWithPage(evt, window, value) {
  const type = evt.type;
  let url = evt.url;

  if (value === "webview") {
    url = mp.$$adapter.tool.completeURL(url, window.location.origin);

    const options = {
      url: `/pages/webview/index?url=${encodeURIComponent(url)}`,
    };
    if (type === "jump") wx.redirectTo(options);
    else if (type === "open") wx.navigateTo(options);
  } else if (value === "error") {
    console.error(`page not found: ${evt.url}`);
  } else if (value !== "none") {
    const targeturl = `${
      window.location.origin
    }/redirect?url=${encodeURIComponent(url)}`;
    const options = {
      url: `/pages/${value}/index?type=${type}&targeturl=${encodeURIComponent(
        targeturl,
      )}`,
    };
    if (window.$$miniprogram.isTabBarPage(`/pages/${value}/index`))
      wx.switchTab(options);
    else if (type === "jump") wx.redirectTo(options);
    else if (type === "open") wx.navigateTo(options);
  }
}

Page({
  data: {
    pageId: "",
    bodyClass: "h5-body miniprogram-root",
    bodyStyle: "",
    rootFontSize: "12px",
    pageStyle: "",
  },
  onLoad(query) {
    const pageName = mp.$$adapter.tool.getPageName(this.route);
    this.pageConfig = config.pages[pageName];
    const pageConfig = this.pageConfig || {};

    if (pageConfig.loadingText) {
      wx.showLoading({
        title: pageConfig.loadingText,
        mask: true,
      });
    }

    const mpRes = mp.createPage(this.route, config);
    this.pageId = mpRes.pageId;
    this.window = mpRes.window;
    this.document = mpRes.document;
    this.query = query;

    if (typeof this.getTabBar === "function")
      this.window.getTabBar = this.getTabBar.bind(this);

    if (config.redirect && config.redirect.notFound) {
      this.window.addEventListener("pagenotfound", evt => {
        dealWithPage(evt, mpRes.window, config.redirect.notFound);
      });
    }

    if (config.redirect && config.redirect.accessDenied) {
      this.window.addEventListener("pageaccessdenied", evt => {
        dealWithPage(evt, mpRes.window, config.redirect.accessDenied);
      });
    }

    if (
      query.type === "open" ||
      query.type === "jump" ||
      query.type === "share"
    ) {
      this.window.$$miniprogram.init(
        query.targeturl ? decodeURIComponent(query.targeturl) : null,
      );

      if (query.search)
        this.window.location.search = decodeURIComponent(query.search);
      if (query.hash)
        this.window.location.hash = decodeURIComponent(query.hash);
    } else {
      this.window.$$miniprogram.init();
    }

    if (!pageConfig.share) {
      wx.hideShareMenu();
    }

    this.document.documentElement.addEventListener("$$domNodeUpdate", () => {
      if (pageConfig.rem) {
        const rootFontSize = this.document.documentElement.style.fontSize;
        if (rootFontSize && rootFontSize !== this.data.rootFontSize)
          this.setData({ rootFontSize });
      }
      if (pageConfig.pageStyle) {
        const pageStyle = this.document.documentElement.style.cssText;
        if (pageStyle && pageStyle !== this.data.pageStyle)
          this.setData({ pageStyle });
      }
    });

    this.document.documentElement.addEventListener("$$childNodesUpdate", () => {
      const domNode = this.document.body;
      const data = {
        bodyClass: `${domNode.className || ""} h5-body miniprogram-root`, // 增加默认 class
        bodyStyle: domNode.style.cssText || "",
      };

      if (
        data.bodyClass !== this.data.bodyClass ||
        data.bodyStyle !== this.data.bodyStyle
      ) {
        this.setData(data);
      }
    });

    this.window.$$createSelectorQuery = () => wx.createSelectorQuery().in(this);

    this.window.$$createIntersectionObserver = options =>
      wx.createIntersectionObserver(this, options);

    init(this.window, this.document);
    this.setData({
      pageId: this.pageId,
    });
    this.app = this.window.createApp();
    this.window.$$trigger("load");
    this.window.$$trigger("wxload", { event: query });
  },
  onShow() {
    global.$$runtime = {
      window: this.window,
      document: this.document,
    };
    this.window.$$trigger("wxshow");
  },
  onReady() {
    if (this.pageConfig.loadingText) wx.hideLoading();
    this.window.$$trigger("wxready");
  },
  onHide() {
    global.$$runtime = null;
    this.window.$$trigger("wxhide");
  },
  onUnload() {
    this.window.$$trigger("beforeunload");
    this.window.$$trigger("wxunload");
    if (this.app && this.app.$destroy) this.app.$destroy();
    this.document.body.$$recycle(); // 回收 dom 节点

    mp.destroyPage(this.pageId);
    global.$$runtime = null;

    this.pageConfig = null;
    this.pageId = null;
    this.window.getTabBar = null;
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
      } else {
        const location = this.window.location;

        query.targeturl = encodeURIComponent(location.href);
        query.search = encodeURIComponent(location.search);
        query.hash = encodeURIComponent(location.hash);
      }

      query.type = "share";
      const queryString = Object.keys(query)
        .map(key => `${key}=${query[key] || ""}`)
        .join("&");
      const currentPagePath = `${this.route}?${queryString}`;
      shareOptions.path = currentPagePath;

      return shareOptions;
    }
  },
  /* PAGE_SCROLL_FUNCTION */
  /* REACH_BOTTOM_FUNCTION */
  /* PULL_DOWN_REFRESH_FUNCTION */
});
