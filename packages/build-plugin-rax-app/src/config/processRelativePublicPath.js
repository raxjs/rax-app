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

    // Update copy public output path, when outputPath is `xx/build/${target}`
    // { from: 'src/public', to: 'web/public' }  =>  { from: 'src/public', to: 'public' }
    if (config.plugins.get('copyWebpackPlugin')) {
      config.plugin('copyWebpackPlugin').tap((args) => args.map((arg) => {
        if (Array.isArray(arg)) {
          // [{ from: 'xx', to: 'xxx' }]
          return arg.map((pattern) => {
            if (typeof pattern === 'object' && pattern.to === `${target}/public`) {
              return Object.assign(pattern, { to: 'public' });
            }
            return pattern;
          });
        }
        return arg;
      }));
    }
  }
};