import modifyRoutes from './modifyRoutes';

export default (staticConfig, targetPath, srcPath) => {
  const { routes } = staticConfig;

  staticConfig.routes = modifyRoutes(routes, targetPath, 'Page.tsx', srcPath);

  return staticConfig;
};
