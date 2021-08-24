import modifyRoutes from './modifyRoutes';

export default function modifyStaticConfigRoutes(staticConfig: any, tempPath: string, srcPath: string, mpa: boolean) {
  const { routes } = staticConfig;

  staticConfig.routes = modifyRoutes(routes, tempPath, srcPath, mpa);

  return staticConfig;
}
