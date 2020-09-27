const { join, relative, sep, resolve } = require('path');
const { existsSync, statSync, readJSONSync } = require('fs-extra');
const enhancedResolve = require('enhanced-resolve');
const targetPlatformMap = require('./platformMap');

const extensions = ['.js', '.jsx', '.ts', '.tsx'];

function startsWith(prevString, nextString) {
  return prevString.indexOf(nextString) === 0;
}

function startsWithArr(prevString, nextStringArr = []) {
  return nextStringArr.some(nextString => startsWith(prevString, nextString));
}

function loadAsFile(module) {
  if (existsSync(module) && statSync(module).isFile()) {
    return module;
  }
  for (let e of extensions) {
    if (existsSync(module + e) && statSync(module + e).isFile()) {
      return module;
    }
  }
}

function loadAsDirectory(module) {
  if (!existsSync(module)) {
    return;
  }
  let stat = statSync(module);
  if (stat.isDirectory()) {
    for (let e of extensions) {
      const indexFile = join(module, `index${e}`);
      if (existsSync(indexFile) && statSync(indexFile).isFile()) {
        return join(module, 'index');
      }
    }
  } else if (stat.isFile()) {
    return loadAsFile(module);
  }
}

/**
 * Resolve relative path.
 * @param {string} script
 * @param {string} dependency
 * @return {string}
 */
function relativeModuleResolve(script, dependency) {
  if (startsWithArr(dependency, ['./', '../', '/', '.\\', '..\\', '\\'])) {
    let dependencyPath = join(script, dependency);
    return relative(
      script,
      loadAsFile(dependencyPath) || loadAsDirectory(dependencyPath)
    );
  } else throw new Error('The page source path does not meet the requirements');
};

/**
 * Use '/' as path sep regardless of OS when outputting the path to code
 * @param {string} filepath
 */
function normalizeOutputFilePath(filepath) {
  return filepath.replace(/\\/g, '/');
}

function getRelativePath(filePath) {
  let relativePath;
  if (filePath[0] === sep) {
    relativePath = `.${filePath}`;
  } else if (filePath[0] === '.') {
    relativePath = filePath;
  } else {
    relativePath = `.${sep}${filePath}`;
  }
  return relativePath;
}

/**
 * ./pages/foo -> based on src, return original
 * /pages/foo -> based on rootContext
 * pages/foo -> based on src, add prefix: './' or '.\'
 */
function getDepPath(rootDir, source, sourcePath = 'src') {
  if (source[0] === sep || source[0] === '.') {
    return join(rootDir, sourcePath, source);
  } else {
    return resolve(rootDir, sourcePath, source);
  }
}

/**
 * Resolve absolute path
 * @param  {...any} files
 */
function absoluteModuleResolve(...files) {
  return enhancedResolve.create.sync({
    extensions: ['.ts', '.js', '.tsx', '.jsx', '.json']
  })(...files);
}

/**
 * get more specific files in miniapp
 * @param {string} platform
 * @param {string[]} extensions
 */
function getPlatformExtensions(platform, extensions = []) {
  return [
    ...platform ? extensions.map((ext) => `.${platform}${ext}`) : [],
    ...extensions,
  ];
}

/**
 * Judge whether the file is a native page according to the existence of the template file
 * @param {string} filePath
 * @param {string} target
 */
function isNativePage(filePath, target) {
  if (existsSync(filePath + targetPlatformMap[target].extension.xml)) {
    try {
      const jsonContent = readJSONSync(`${filePath}.json`);
      return !jsonContent.component;
    } catch (e) {}
    // If json file doesn't exist or not declare component: true, then it's a native page
    return true;
  }
  return false;
}

/**
 * Remove file extension
 * @param {string} filePath
 */
function removeExt(filePath) {
  const lastDot = filePath.lastIndexOf('.');
  return lastDot === -1 ? filePath : filePath.slice(0, lastDot);
}

module.exports = {
  relativeModuleResolve,
  normalizeOutputFilePath,
  getRelativePath,
  getDepPath,
  absoluteModuleResolve,
  getPlatformExtensions,
  isNativePage,
  removeExt
};
