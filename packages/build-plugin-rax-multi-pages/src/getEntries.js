const path = require('path');
const fs = require('fs-extra');

module.exports = (context) => {
  const { rootDir } = context;

  // MPA
  let routes = [];

  try {
    routes = fs.readJsonSync(path.resolve(rootDir, 'src/app.json')).routes;
  } catch (e) {
    console.error(e);
    throw new Error('routes in app.json must be array');
  }

  return routes.map((route) => {
    let entryName = 'index';
    if (route.path && route.path !== '/') {
      // Example: '/page1' -> 'page1/index'
      entryName = path.join(route.path, 'index').replace(/^\//, '');
    }

    return {
      entryName,
      ...route,
    };
  });
};
