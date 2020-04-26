const invokeModules = require('../utils/invokeModules');
const genCode = require('./genCode');

function generate(parsed, { plugins }) {
  const { code, map } = genCode(parsed.ast);
  const ret = {
    code, map,
    // config, template, style and others should be generated in plugin modules.
  };

  invokeModules(plugins, 'generate', ret, parsed);

  return ret;
}


exports.generate = generate;
