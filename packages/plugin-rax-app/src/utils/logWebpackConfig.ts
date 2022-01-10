import debugCore from 'debug';

const debug = debugCore('rax-app');

export default (configs) => {
  try {
    const tmp = [];
    debug(JSON.stringify(configs, (key, val) => {
      if (val != null && typeof val === 'object') {
        if (tmp.indexOf(val) >= 0) {
          return;
        }
        tmp.push(val);
      }
      return val;
    }, 2));
  } catch (error) {
    // ignore error
  }
};
