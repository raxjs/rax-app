const path = require('path');

module.exports = function compile() {
  process.argv.push('--gulpfile', path.resolve(__dirname, './gulpfile.js'));
  process.argv.push('--cwd', process.cwd());
  require('gulp-cli')();
};
