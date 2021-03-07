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
    if (enableStatus) {
      listen(resolve);
    } else {
      resolve(cacheAssets);
    }
  });
}

function getAssets() {
  return cacheAssets;
}

function updateEnableStatus(val) {
  enableStatus = val;
}

export { emit, listen, registerListenTask, getAssets, updateEnableStatus };
