/* INIT_FUNCTION */
/* global appConfig,App,getCurrentPages */
const LIFE_CYCLE_METHODS = [
  'onLaunch',
  'onShow',
  'onHide',
  'onError',
  'onPageNotFound',
];
const extraConfig = {};
for (const key in appConfig) {
  if (LIFE_CYCLE_METHODS.indexOf(key) === -1) extraConfig[key] = appConfig[key];
}

// eslint-disable-next-line new-cap
App({
  onLaunch(options) {
    if (appConfig.onLaunch) appConfig.onLaunch.call(this, options);
  },
  onShow(options) {
    if (appConfig.onShow) appConfig.onShow.call(this, options);
  },
  onHide() {
    if (appConfig.onHide) appConfig.onHide.call(this);
  },
  onError(err) {
    // Support error event of window
    const pages = getCurrentPages() || [];
    const currentPage = pages[pages.length - 1];
    if (currentPage && currentPage.window) {
      currentPage.window.$$trigger('error', {
        event: err,
      });
    }

    if (appConfig.onError) appConfig.onError.call(this, err);
  },
  onPageNotFound(options) {
    if (appConfig.onPageNotFound) appConfig.onPageNotFound.call(this, options);
  },

  ...extraConfig,
});
