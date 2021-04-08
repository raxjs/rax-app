export default function (fileInfo) {
  const appJSON = JSON.parse(fileInfo.source);

  appJSON.routes = appJSON.routes.map((route) => {
    let name;
    if (route.name) {
      name = `pages/${name}`;
    } else if (route.path === '/') {
      name = 'pages/index';
    } else {
      name = `pages${route.path}/index`;
    }
    return {
      ...route,
      name,
    };
  });

  return JSON.stringify(appJSON, null, 2);
}
