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
    const funcsDir = path.resolve(rootDir, outputDir, 'api', name);

    // copy function file
    // eslint-disable-next-line no-await-in-loop
    await copy(src, funcsDir);
    // eslint-disable-next-line no-await-in-loop
    await copyDependenices(rootDir, funcsDir, dependencies);
  }
};

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

    // eslint-disable-next-line no-await-in-loop
    await copy(insPath, cpPath);
  }
}
