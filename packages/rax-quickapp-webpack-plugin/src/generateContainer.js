const chalk = require('chalk');
const fs = require('fs-extra');
const path = require('path');
const downloadGithubRepoLatestRelease = require('./utils/downloadRepo');
const { unzip } = require('./utils/file');
const spinner = require('./utils/spinner');

module.exports = async(options) => {
  const { distDirectory, workDirectory } = options;
  if (!fs.existsSync(path.join(distDirectory, 'sign'))) {
    spinner.start('Preparing environment for Quick App...');
    console.log();
    const destPath = path.join(distDirectory, 'download_temp.zip');
    if (!fs.existsSync(destPath)) {
      try {
        await downloadGithubRepoLatestRelease('alijk-fe/quickapp-container', workDirectory, destPath);
      } catch (error) {
        console.error(error);
        return false;
      }
    }
    await unzip(destPath);
    spinner.succeed('Ready for Quick App\'s environment!');
    console.log();
  } else {
    console.log(`${chalk.green('✔ ')} Environment is ready for Quick App!`);
  }
  return true;
};
