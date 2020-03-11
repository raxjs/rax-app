const path = require('path');

// Support publicPath use relative path (Called in build script).
module.exports = (target, config) => {
  // Change webpack outputPath from  'xx/build'            to `xx/build/${target}`
  // Change source file's name from  `${target}/[name].js` to '[name].js'
  // After the above changes, all the asset paths are relative to the entry file (like index.html).
  const publicPath = config.output.get('publicPath');
  if (publicPath.startsWith('.')) {
    config.output.publicPath(publicPath.endsWith('/') ? publicPath : `${publicPath}/`);
    // Update output path and filename
    config.output.path(path.resolve(config.output.get('path'), target));
    config.output.filename('[name].js');
  }
};