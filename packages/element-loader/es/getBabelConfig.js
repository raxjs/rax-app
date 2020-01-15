import fs from 'fs';
export default function getBabelConfig(query) {
  if (query === void 0) {
    query = {};
  }

  var result = {};
  var BABELRC_FILE = process.cwd() + '/.babelrc';

  if (query.babel) {
    result = query.babel;
  } else {
    var content = fs.readFileSync(BABELRC_FILE);

    try {
      var config = JSON.parse(content);
      result = config;
    } catch (e) {
      console.error('`.babelrc` config error');
    }
  }

  if (!result.presets && !result.plugins) {
    console.error('please config `.babelrc` or `webpack.config.js` loader query');
  }

  return result;
}
;