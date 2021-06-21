import * as path from 'path';
import * as globby from 'globby';
import { getRaxPagesName, getPagePath } from './getPath';
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
  const appStoreFilePath = `store.${projectType}`;
  const appStoreMatchingPaths = globby.sync('store.*', { cwd: srcPath });
  return checkFileExists(srcPath, appStoreMatchingPaths, appStoreFilePath);
}

/**
 * check src/pages/Home/store.[js|ts] if's expected
 */
function checkExpectedPageStore(rootDir, srcPath, projectType) {
  const pagesNames = getRaxPagesName(rootDir);

  const existStorePageNames = pagesNames.filter((pageName) => {
    const pagePath = getPagePath({ srcPath, pageName });
    const pageStoreFilePath = `store.${projectType}`;
    const pageStoreMatchingPaths = globby.sync('store.*', { cwd: pagePath });
    return checkFileExists(pagePath, pageStoreMatchingPaths, pageStoreFilePath);
  });

  return !!existStorePageNames.length;
}

function checkFileExists(absolutePath: string, matchingPaths: string[], expectedFilePath: string) {
  if (!matchingPaths.length) {
    return false;
  } else {
    if (!matchingPaths.find((matchingPath) => matchingPath === expectedFilePath)) {
      console.log(chalk.yellow(
        chalk.black.bgYellow(' WARNING '),
        `Expect ${path.join(absolutePath, expectedFilePath)}, but found ${matchingPaths.map((matchingPath) => path.join(absolutePath, matchingPath)).join(', ')}.`,
      ));
      return false;
    }
    return true;
  }
}

export default checkExpectedStoreFileExists;
