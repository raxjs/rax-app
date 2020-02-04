const path = require('path');
const glob = require('glob');
const fs = require('fs');

module.exports = function(rootDir, options = {}) {
  const demos = [];
  const isNode = options.type === 'node';

  // Compatible with original way
  // ├── demo
  // |  ├── index.jsx
  if (!isNode) {
    // read demos
    glob.sync(path.resolve(rootDir, 'demo/*.{js,jsx,md}')).forEach(filePath => {
      const name = filePath.substring(
        filePath.lastIndexOf('/') + 1,
        Math.max(filePath.indexOf('.js'), filePath.indexOf('.md')),
      );

      demos.push({
        name,
        filePath,
      });
    });
  }

  const files = fs.readdirSync(path.resolve(rootDir, 'demo'));
  const folders = files.filter((f) => {
    if (/\.(js|jsx|md)$/.test(f)) {
      return false;
    }

    if (/(wechat-miniprogram|miniapp)$/.test(f)) {
      return false;
    }

    return true;
  });

  // ├── demo
  // |  ├── index
  // |  |  ├── index.client.jsx
  // |  |  ├── index.server.jsx
  const platform = isNode ? 'server' : 'client';
  folders.forEach((folder) => {
    let platformEntry;

    glob.sync(path.resolve(rootDir, `demo/${folder}/index.${platform}.{js,jsx}`)).forEach(filePath => {
      platformEntry = filePath;
    });

    // If index.{platform}.{js,jsx} are not found, use index.{js,jsx}
    if (!platformEntry) {
      glob.sync(path.resolve(rootDir, `demo/${folder}/index.{js,jsx}`)).forEach(filePath => {
        platformEntry = filePath;
      });
    }

    if (platformEntry) {
      demos.push({
        name: folder,
        filePath: platformEntry,
      });
    }
  });

  return demos;
};
