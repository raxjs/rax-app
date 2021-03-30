import * as chalk from 'chalk';
import * as path from 'path';
import * as globby from 'globby';
import { getAppStorePath, getRaxPagesName, getPageStorePath } from './getPath';

function checkExpectedStoreFileExists({ rootDir, srcDir, projectType }) {
  const srcPath = path.join(rootDir, srcDir);

  checkExpectedAppStore(srcPath, projectType);
  checkExpectedPageStore(rootDir, srcPath, projectType);
}

/**
 * check src/store.[js/ts] if it's expected
 */
function checkExpectedAppStore(srcPath, projectType) {
  const appStoreFilePath = getAppStorePath({ srcPath, projectType });
  const appStoreMatchingPaths = globby.sync(path.join(srcPath, 'store.*'));
  checkFileExists(appStoreMatchingPaths, appStoreFilePath);
}

/**
 * check src/pages/Home/store.[js|ts] if's expected
 */
function checkExpectedPageStore(rootDir, srcPath, projectType) {
  const pagesNames = getRaxPagesName(rootDir);
  pagesNames.forEach((pageName) => {
    const pageStorePath = getPageStorePath({ pageName, srcPath, projectType });
    const pageStoreMatchingPaths = globby.sync(pageStorePath.replace(`store.${projectType}`, 'store.*'));
    checkFileExists(pageStoreMatchingPaths, pageStorePath);
  });
}

function checkFileExists(matchingPaths: string[], expectedFilePath: string) {
  if (matchingPaths.length && !matchingPaths.find((matchingPath) => matchingPath === expectedFilePath)) {
    console.log(chalk.yellow(chalk.black.bgYellow(' WARNING '), `Expect ${expectedFilePath}, but found ${matchingPaths.join(', ')}.`));
  }
}

export default checkExpectedStoreFileExists;
