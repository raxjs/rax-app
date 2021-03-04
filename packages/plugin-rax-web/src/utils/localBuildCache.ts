const callbacks = [];
let enableListen = false;
let cacheAssets = {};

function emit(assets) {
  cacheAssets = assets;
  let fn;
  // eslint-disable-next-line no-cond-assign
  while (fn = callbacks.pop()) {
    fn(assets);
  }
}

function listen(callback) {
  callbacks.push(callback);
}

function registerListenTask() {
  return new Promise((resolve) => {
    listen(resolve);
  });
}

function updateEnableStatus(val: boolean) {
  enableListen = val;
}

function getEnableStatus(): boolean {
  return enableListen;
}

function getCacheAssets() {
  return cacheAssets;
}

export {
  emit,
  listen,
  registerListenTask,
  updateEnableStatus,
  getEnableStatus,
  getCacheAssets,
};
