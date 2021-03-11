export default function (fileInfo) {
  const appJSON = JSON.parse(fileInfo.source);

  appJSON.routes = appJSON.routes.map((route) => {
    let name = `pages${route.path}/index`;

    if (route.path === '/') {
      name = 'pages/index';
    }
    return {
      name,
      ...route,
    };
  });

  return JSON.stringify(appJSON, null, 2);
}
