const fs = require('fs-extra');
const path = require('path');

module.exports = (filename, content, { rootDir }) => {
  const tempPath = path.join(rootDir, 'node_modules/.tmp/@builder');
  fs.ensureDirSync(tempPath);
  fs.writeFileSync(path.join(tempPath, filename), content);
};
