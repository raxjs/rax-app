const {
  join,
  relative
} = require('path');
const {
  existsSync,
  statSync,
} = require('fs-extra');

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
* Resolve node path.
 * @param {string} script
 * @param {string} dependency
* @return {*}
*/
module.exports = function resolve(script, dependency) {
  if (startsWithArr(dependency, ['./', '../', '/', '.\\', '..\\', '\\'])) {
    let dependencyPath = join(script, dependency);
    return relative(script, loadAsFile(dependencyPath) || loadAsDirectory(dependencyPath));
  } else throw new Error('The page source path does not meet the requirements');
};
