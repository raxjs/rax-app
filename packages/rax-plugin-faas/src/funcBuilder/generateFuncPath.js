const path = require('path');
const fs = require('fs');
const { BUILD_IN_MODULES } = require('./constants');

const REQUIRE_PATTERN = /require\(['|"](.*?)['|"]\)/g;

function isLocal(str) {
  return /^\.|^\/|^\\/.test(str);
}

/**
 * generate function source file path and dependencies path
 */
module.exports = (cwd = process.cwd(), functionConfig) => {
  const { functionArr } = functionConfig;
  // const funcNames = Object.keys(functions);
  const funcFiles = {};

  functionArr.forEach((func) => {
    const funcPath = path.resolve(func.realPath, `${func.handlerFile}.js`);

    funcFiles[func.name] = {
      src: func.realPath,
      dependencies: {},
    };

    const funcContent = fs.readFileSync(funcPath, 'utf-8');
    const nodeModulesPath = path.resolve(cwd, 'node_modules');

    let result = REQUIRE_PATTERN.exec(funcContent);
    while (result !== null) {
      const depName = result[1];

      // TODO: collect local files
      if (!BUILD_IN_MODULES.includes(depName) && !isLocal(depName)) {
        // collect dependencies
        collectDepsPath(cwd, nodeModulesPath, depName, funcFiles[func.name].dependencies);
      }
      result = REQUIRE_PATTERN.exec(funcContent);
    }
  });

  return funcFiles;
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
