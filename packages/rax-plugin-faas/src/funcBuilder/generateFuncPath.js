const path = require('path');
const fs = require('fs');
const { BUILD_IN_MODULES } = require('./constants');

const REQUIRE_PATTERN = /require\(['|"](.*?)['|"]\)/g;

function getFuncPath (cwd, handler = '') {
  const paths = /\.js$/.test(handler)
    ? [handler]
    : [handler + '.js' , handler + '/index.js'];

  for (let i = 0; i < paths.length; i++) {
    const fileResolvePath = path.resolve(cwd, paths[i]);

    if (fs.existsSync(fileResolvePath)) {
      return fileResolvePath;
    }
  }

  return '';
}

function isLocal(str) {
  return /^\.|^\/|^\\/.test(str);
}

/**
 * generate function source file path and dependencies path
 */
module.exports = (cwd = process.cwd(), options = {}) => {
  try {
    const { functions } = options;
    const funcNames = Object.keys(functions);
    const funcFiles = {};

    let i = -1;
    while (++i < funcNames.length) {
      const funcName = funcNames[i];
      const { handler = '' } = functions[funcName] || {};
      const funcPath = getFuncPath(cwd, handler);

      // If handler file is not exist
      if (!funcPath) {
        console.log(`The function ${funcName} file is not existed.`);
        console.log(`Please make sure handler is a existed file path.`);
        continue;
      };

      const funcDeps = (funcFiles[funcName] = {
        src: funcPath,
        dependencies: {}
      });

      const funcContent = fs.readFileSync(funcPath, 'utf-8');
      const nodeModulesPath = path.resolve(cwd, 'node_modules');

      while ((result = REQUIRE_PATTERN.exec(funcContent)) !== null) {
        const depName = result[1];

        // TODO: collect local files
        if (!BUILD_IN_MODULES.includes(depName) && !isLocal(depName)) {
          // collect dependencies
          collectDepsPath(cwd, nodeModulesPath, depName, funcDeps.dependencies);
        }
      }
    }
    return funcFiles;
  } catch(err) {
    console.error(err);
    process.exist(1);
  }
}

// recursive collect dependencies path
function collectDepsPath(root, nodeModulesPath, pkgName, deps = {}) {
  const pkgInstallPath = getPkgInstallPath(root, nodeModulesPath, pkgName);

  if (!pkgInstallPath) {
    throw new Error(`${pkgName} is not exist in ${root},\nrun npm install ${pkgName} --save to install it.`);
  }

  const pkgJsonPath = path.resolve(pkgInstallPath, 'package.json');
  const pkgJson = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf-8'));
  const subModulePath = path.resolve(pkgInstallPath, 'node_modules');
  const pkgDeps = pkgJson.dependencies || {};
  const pkgDepsArr = Object.keys(pkgDeps);

  deps[`${pkgName}@@${pkgJson.version}`] = pkgInstallPath;

  let i = -1;
  while(++i < pkgDepsArr.length) {
    const depName = pkgDepsArr[i];
    collectDepsPath(root, subModulePath, depName, deps);
  }
}

// get package install path
function getPkgInstallPath(root, nodeModulesPath, pkgName) {
  while (root !== nodeModulesPath) {
    const pkgPath = path.resolve(nodeModulesPath, pkgName);
    if (isInstallPath(pkgPath)) {
      return pkgPath;
    } else {
      nodeModulesPath = path.resolve(nodeModulesPath, '../');
    }
  }
}

// the package install dir is `pkgPath`
function isInstallPath(pkgPath) {
  const pkgJsonPath = path.resolve(pkgPath, 'package.json');

  return fs.existsSync(pkgJsonPath);
}
