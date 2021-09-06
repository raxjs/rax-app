export type RouteComponentType = JSX.Element;

export interface IRoute {
  path?: string;
  source: string;
  component: RouteComponentType;
  lazy?: boolean;
  keepAlive?: boolean;
  [key: string]: unknown;
}
