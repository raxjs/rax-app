const path = require('path');
const recursiveCopy = require('recursive-copy');

/**
 * build functions
 */
module.exports = async (context, functions) => {
  const { rootDir, userConfig } = context;
  const { outputDir } = userConfig;

  const names = Object.keys(functions);
  for (let i = 0; i < names.length; i++) {
    const name = names[i];
    const { src, dependencies } = functions[name];
    const funcsDir = path.resolve(rootDir, outputDir, 'serverless', name);

    // copy function file
    await copy(src, funcsDir);
    await copyDependenices(rootDir, funcsDir, dependencies);
  }
}

// copy file or dir
async function copy(src, target) {
  // fs.copySync(src, target);
  return recursiveCopy(src, target, {
    overwrite: true,
    expand: true,
    dot: true,
  });
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
