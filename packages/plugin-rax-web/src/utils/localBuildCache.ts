const callbacks = [];
let cacheAssets = {};
let enableStatus = false;

function emit(assets) {
  cacheAssets = assets;
  let fn;
  // eslint-disable-next-line no-cond-assign
  while ((fn = callbacks.pop())) {
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

function getAssets() {
  return cacheAssets;
}

function updateEnableStatus(val: boolean) {
  enableStatus = val;
}

function getEnableStatus() {
  return enableStatus;
}

export { emit, listen, registerListenTask, getAssets, updateEnableStatus, getEnableStatus };
