import modifyRoutes from './modifyRoutes';

export default (staticConfig, tempPath, filename, srcPath, projectType, mpa) => {
  const { routes } = staticConfig;

  staticConfig.routes = modifyRoutes(routes, tempPath, filename, srcPath, projectType, mpa);

  return staticConfig;
};
