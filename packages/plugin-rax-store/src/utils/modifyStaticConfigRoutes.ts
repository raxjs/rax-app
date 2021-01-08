import modifyRoutes from './modifyRoutes';

export default (staticConfig, targetPath) => {
  const { routes } = staticConfig;

  staticConfig.routes = modifyRoutes(routes, targetPath, 'Page.tsx');

  return staticConfig;
};
