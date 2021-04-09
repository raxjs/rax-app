import * as path from 'path';
import * as globby from 'globby';
import { getAppStorePath, getRaxPagesName, getPageStorePath } from './getPath';
// TODO use import declaration
const chalk = require('chalk');

function checkExpectedStoreFileExists({ rootDir, srcDir, projectType }) {
  const srcPath = path.join(rootDir, srcDir);
  const appStoreExists = checkExpectedAppStore(srcPath, projectType);
  const pageStoreExists = checkExpectedPageStore(rootDir, srcPath, projectType);
  return appStoreExists || pageStoreExists;
}

/**
 * check src/store.[js/ts] if it's expected
 */
function checkExpectedAppStore(srcPath, projectType) {
  const appStoreFilePath = getAppStorePath({ srcPath, projectType });
  const appStoreMatchingPaths = globby.sync(path.join(srcPath, 'store.*'));
  return checkFileExists(appStoreMatchingPaths, appStoreFilePath);
}

/**
 * check src/pages/Home/store.[js|ts] if's expected
 */
function checkExpectedPageStore(rootDir, srcPath, projectType) {
  const pagesNames = getRaxPagesName(rootDir);

  const existStorePageNames = pagesNames.filter((pageName) => {
    const pageStorePath = getPageStorePath({ pageName, srcPath, projectType });
    const pageStoreMatchingPaths = globby.sync(pageStorePath.replace(`store.${projectType}`, 'store.*'));
    return checkFileExists(pageStoreMatchingPaths, pageStorePath);
  });

  return !!existStorePageNames.length;
}

function checkFileExists(matchingPaths: string[], expectedFilePath: string) {
  if (!matchingPaths.length) {
    return false;
  } else {
    if (!matchingPaths.find((matchingPath) => matchingPath === expectedFilePath)) {
      console.log(chalk.yellow(chalk.black.bgYellow(' WARNING '), `Expect ${expectedFilePath}, but found ${matchingPaths.join(', ')}.`));
      return false;
    }
    return true;
  }
}

export default checkExpectedStoreFileExists;
