const chalk = require('chalk');

module.exports = () => {
  console.log(chalk.red('请及时升级工程到 rax-app@3.x ，本工程即将在 10 月份停止维护！'));
  console.log();
  console.log(chalk.red('执行 npx rax-codemod 一键升级！'));
  console.log();
  console.log(chalk.red('升级指南：https://rax.js.org/docs/guide/migration-guide'));
};
