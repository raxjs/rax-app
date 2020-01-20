const path = require('path');
const glob = require('glob');

module.exports = function(rootDir) {
  const demos = [];
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

  return demos;
};
