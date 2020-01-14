const path = require('path');
const fs = require('fs-extra');
const { getRouteName } = require('rax-compile-config');

module.exports = (context) => {
  const { rootDir } = context;

  let config = {};
  try {
    config = fs.readJsonSync(path.resolve(rootDir, 'src/app.json'));
  } catch (e) {
    console.error(e);
    throw new Error('routes in app.json must be array');
  }

  config.routes = config.routes.map(route => {
    route.name = route.source; // Use source as route name
    return {
      entryName: getRouteName(route, rootDir),
      ...route,
    };
  });

  return config;
};
