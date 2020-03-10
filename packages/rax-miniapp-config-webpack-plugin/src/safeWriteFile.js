const { dirname } = require('path');
const { writeFileSync, writeJSONSync, ensureDirSync } = require('fs-extra');

/**
 * @param {string} outputPath - file outputPath
 * @param {string} content - file content
 * @param {boolean} isJSON - wheater json file
 */
module.exports = function(outputPath, content, isJSON) {
  ensureDirSync(dirname(outputPath));
  if (isJSON) {
    writeJSONSync(outputPath, content, {
      spaces: 2
    });
  } else {
    writeFileSync(outputPath, content);
  }
};
