export type RouteComponentType = JSX.Element;

export type AsyncRouteComponentType = () => Promise<RouteComponentType>;

export interface IRoute {
  path?: string;
  source?: string;
  component: RouteComponentType | AsyncRouteComponentType | Promise<RouteComponentType>;
  lazy?: boolean;
  keepAlive?: boolean;
  [key: string]: unknown;
}
