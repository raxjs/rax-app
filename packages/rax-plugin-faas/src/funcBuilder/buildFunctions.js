const path = require('path');
const recursiveCopy = require('recursive-copy');

/**
 * build functions
 */
module.exports = async (cwd, functions) => {
  const names = Object.keys(functions);

  for (let i = 0; i < names.length; i++) {
    const name = names[i];
    const { src, dependencies } = functions[name];
    const funcsDir = path.resolve(cwd, './.serverless');

    await copyFunction(cwd, funcsDir, src);
    await copyDependenices(cwd, funcsDir, dependencies);
  }
}

// copy file or dir
async function copy(src, target) {
  return recursiveCopy(src, target, {
    overwrite: true,
    expand: true,
    dot: true,
  });
}

// copy function file
async function copyFunction(cwd, targetDir, funcPath) {
  const cpPath = funcPath.replace(cwd, targetDir);

  await copy(funcPath, cpPath);
}

// copy function dependencies
async function copyDependenices(cwd, targetDir, dependencies) {
  const depKeys = Object.keys(dependencies);
  for (let i = 0; i < depKeys.length; i++) {
    const insPath = dependencies[depKeys[i]];
    const cpPath = insPath.replace(cwd, targetDir);

    await copy(insPath, cpPath);
  }
}
