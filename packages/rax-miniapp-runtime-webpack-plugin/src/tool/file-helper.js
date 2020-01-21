const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

/**
 * Create directories recursively
 */
function recursiveMkdir(dirPath) {
  const prevDirPath = path.dirname(dirPath);
  try {
    fs.accessSync(prevDirPath);
  } catch (err) {
    // Upper level directory does not exist
    recursiveMkdir(prevDirPath);
  }

  try {
    fs.accessSync(dirPath);

    const stat = fs.statSync(dirPath);
    if (stat && !stat.isDirectory()) {
      // Target path exists but is not a directory
      fs.renameSync(dirPath, `${dirPath}.bak`); // Rename the file as .bak suffix
      fs.mkdirSync(dirPath);
    }
  } catch (err) {
    // Target path does not exist
    fs.mkdirSync(dirPath);
  }
}


/**
 * Copy files
 */
function copyFile(fromPath, toPath) {
  recursiveMkdir(path.dirname(toPath));
  return fs.createReadStream(fromPath).pipe(fs.createWriteStream(toPath));
}

/**
 * Copy directories
 */
function copyDir(fromPath, toPath) {
  try {
    fs.accessSync(fromPath);

    const stat = fs.statSync(fromPath);
    if (stat && !stat.isDirectory()) {
      // Target path exists but is not a directory
      return console.log(`path is not directory: "${fromPath}"`);
    }
  } catch (err) {
    // Target path does not exist
    return console.log(`path not exists: "${fromPath}"`);
  }

  const files = fs.readdirSync(fromPath);
  for (const fileName of files) {
    const filePath = path.join(fromPath, fileName);
    const distFilePath = path.join(toPath, fileName);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      copyDir(filePath, distFilePath);
    } else if (stat && stat.isFile()) {
      copyFile(filePath, distFilePath);
    }
  }
}


/**
 * Calculate file md5
 */
function md5File(filePath) {
  return crypto
    .createHash('md5')
    .update(fs.readFileSync(filePath))
    .digest('hex');
}

module.exports = {
  recursiveMkdir,
  copyFile,
  copyDir,
  md5File,
};
