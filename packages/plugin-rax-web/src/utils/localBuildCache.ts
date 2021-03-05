const callbacks = [];
let enableListen = false;
let cacheAssets = {};

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

/**
 * 1. Exist local builder, before local builder compiler created (it's more earlier than web emit hook) enableListen will be true,
 *  so it will resolve the first listen resolve, and then hot reload:
 *  - Something changed that will emit web and local builder all restart, it will be ok as the first one:
 *    - web builder is faster than local builder, enable status has been true when restart(before local builder compiler created), so it will wait local builder emits assets
 *    - local builder is faster than web builder, localBuildTask is ready to resolve when web finished
 *  - Something changed that will only emit web changed:
 *    - the enableListen status has been false when latest emitted, so it will use the last time cache assets as html content
 *
 * 2. There is no local builder, enableListen will be false, everything will be ok, cacheAssets default value is {}
 */
function registerListenTask() {
  return new Promise((resolve) => {
    if (enableListen) {
      listen(resolve);
    } else {
      resolve(cacheAssets);
    }
  });
}

function updateEnableStatus(val: boolean) {
  enableListen = val;
}

export { emit, listen, registerListenTask, updateEnableStatus };
