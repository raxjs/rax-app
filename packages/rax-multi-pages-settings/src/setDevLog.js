const chalk = require('chalk');
const consoleClear = require('console-clear');
const { handleWebpackErr } = require('rax-compile-config');

module.exports = ({ url, err, stats }) => {
  consoleClear(true);

  if (!handleWebpackErr(err, stats)) {
    return;
  }

  console.log(chalk.green('Multi pages development server at:'));
  console.log('   ', chalk.underline.white(url));
  console.log();
};
