import debugCore from 'debug';

const debug = debugCore('rax-app');

export default (configs) => {
  try {
    // 用 JSON.stringify 的 replacer 解 cyclic object value 的方式，在 Node16 上面会 Crash，所以改用 util.inspect 实现
    // https://stackoverflow.com/questions/11616630/how-can-i-print-a-circular-structure-in-a-json-like-format
    // Node Crash 问题，主要出现在 less@^4 importManager.less.importManager 等循环场景，详见 https://code.alibaba-inc.com/clam-eco/clam/issues/550723
    // 另外，仅在开启 debug 模式下才执行内容，避免干扰普通 build 功能 & 影响性能
    if (debug.enabled) {
      // const tmp = [];
      // debug(JSON.stringify(configs, (key, val) => {
      //   if (val != null && typeof val === 'object') {
      //     if (tmp.indexOf(val) >= 0) {
      //       return;
      //     }
      //     tmp.push(val);
      //   }
      //   return val;
      // }, 2));

      const configsStr = require('util').inspect(configs, { depth: 10, colors: true });
      debug(configsStr);
    }
  } catch (error) {
    // ignore error
  }
};
