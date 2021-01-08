import modifyRoutes from './modifyRoutes';

export default (staticConfig, tempPath, srcPath) => {
  const { routes } = staticConfig;

  staticConfig.routes = modifyRoutes(routes, tempPath, 'Page.tsx', srcPath);

  return staticConfig;
};
