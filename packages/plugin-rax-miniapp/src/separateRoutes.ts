import { separateNativeRoutes } from 'miniapp-builder-shared';

interface IOptions {
  target: string;
  rootDir: string;
}

export default function separateRoutes(routes, { target, rootDir }: IOptions) {
  return separateNativeRoutes(filterByTarget(routes, { target }), { target, rootDir });
}

function filterByTarget(routes, { target }) {
  return routes.filter(({ targets }) => {
    if (!targets) return true;
    return targets.includes(target);
  });
}

