const callbacks = [];
let enableListen = false;

function emit(assets) {
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
    if (enableListen) {
      listen(resolve);
    } else {
      resolve({});
    }
  });
}

function updateEnableStatus(val: boolean) {
  enableListen = val;
}

export {
  emit,
  listen,
  registerListenTask,
  updateEnableStatus,
};
