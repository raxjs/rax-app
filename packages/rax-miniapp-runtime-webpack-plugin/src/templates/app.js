/* INIT_FUNCTION */
/* global init,App,getCurrentPages */
/* eslint-disable module/no-implicit-dependencies */
const render = require('miniapp-render');

// eslint-disable-next-line new-cap
App({
  onLaunch(options) {
    const window = render.createApp();
    init(window);
    this.window = window;
    this.window.$$trigger('launch', {
      event: {
        options,
        context: this
      }
    });
  },
  onShow(options) {
    if (this.window) {
      this.window.$$trigger('appshow', {
        event: {
          options,
          context: this
        }
      });
    }
  },
  onHide() {
    if (this.window) {
      this.window.$$trigger('apphide', {
        event: {
          context: this
        }
      });
    }
  },
  onError(err) {
    if (this.window) {
      // Support error event of window
      const pages = getCurrentPages() || [];
      const currentPage = pages[pages.length - 1];
      if (currentPage && currentPage.window) {
        currentPage.window.$$trigger('error', {
          event: err
        });
      }
      this.window.$$trigger('apperror', {
        event: {
          context: this,
          error: err
        }
      });
    }
  },
  onPageNotFound(options) {
    if (this.window) {
      this.window.$$trigger('pagenotfound', {
        event: {
          options,
          context: this
        }
      });
    }
  },
  onShareAppMessage(options) {
    if (this.window) {
      const shareInfo = {};
      // share app message only can be listened once
      this.window.$$trigger('appshare', { event: { options, shareInfo, context: this } });
      return shareInfo.content;
    }
  }
});
