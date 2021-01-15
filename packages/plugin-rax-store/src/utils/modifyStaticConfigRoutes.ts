import modifyRoutes from './modifyRoutes';

export default (staticConfig, tempPath, filename, srcPath, mpa) => {
  const { routes } = staticConfig;

  staticConfig.routes = modifyRoutes(routes, tempPath, filename, srcPath, mpa);

  return staticConfig;
};
