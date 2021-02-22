const callbacks = [];

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

export {
  emit,
  listen,
};
