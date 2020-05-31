const { relative, dirname } = require('path');
// Get dependency file path
module.exports = function(filePath, selfFilePath) {
  return `./${relative(dirname(selfFilePath), filePath)}`.replace(/\\/g, '/'); // Avoid path error in Windows
};
