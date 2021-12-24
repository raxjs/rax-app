import isWebpack4 from './isWebpack4';

const hookNamesMap = {
  onBeforeSetupMiddleware: 'before',
  onAfterSetupMiddleware: 'after',
};

const hookNames = Object.keys(hookNamesMap);

export default function (devServer) {
  if (isWebpack4) {
    devServer.getValue = function (key) {
      if (hookNames.includes(key)) {
        return devServer.get(hookNamesMap[key]);
      } else {
        return devServer.get(key);
      }
    };
    devServer.setValue = function (key, fn) {
      if (hookNames.includes(key)) {
        devServer.set(hookNamesMap[key], function (...args) {
          const [app, server] = args;
          server.app = app;
          fn.call(this, server);
        });
      } else {
        return devServer.set(key, fn);
      }
    };
  } else {
    devServer.setValue = function (...args) {
      return devServer.set(...args);
    };
    devServer.getValue = function (...args) {
      return devServer.get(...args);
    };
  }

  return devServer;
}
