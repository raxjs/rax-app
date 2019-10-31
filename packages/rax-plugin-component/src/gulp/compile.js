const path = require('path');

module.exports = function compile() {
  process.argv = process.argv.slice(0, 2);
  process.argv.push('--gulpfile', path.resolve(__dirname, './gulpfile.js'));
  process.argv.push('--cwd', process.cwd());
  console.log(process.argv);
  require('gulp-cli')();
};
