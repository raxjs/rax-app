import debugCore from 'debug';
import { inspect } from 'util';

const debug = debugCore('rax-app');

export default (configs) => {
  try {
    // Only executed when the debug mode is turned on
    if (debug.enabled) {
      // Print webpack configs for easy debugging
      debug(inspect(configs, { depth: 10, colors: true }));
    }
  } catch (error) {
    // ignore error
  }
};
