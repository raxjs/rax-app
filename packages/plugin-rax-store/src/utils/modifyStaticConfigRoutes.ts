import modifyRoutes from './modifyRoutes';

export default function modifyStaticConfigRoutes(staticConfig, tempPath, srcPath, projectType, mpa) {
  const { routes } = staticConfig;

  staticConfig.routes = modifyRoutes(routes, tempPath, srcPath, projectType, mpa);

  return staticConfig;
}
