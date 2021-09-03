interface IRouteItem {
  path?: string;
  source: string;
  window?: IWindow;
  name?: string;
  [key: string]: unknown;
}

interface IWindow {
  title?: string;
  pullRefresh?: boolean;
  [key: string]: string | number | boolean;
}

interface ITabBarItem {
  pageName: string;
  icon?: string;
  activeIcon?: string;
}

export interface IStaticConfig {
  routes: IRouteItem[];
  window?: IWindow;
  tabBar?: {
    custom?: boolean;
    list?: string[];
    textColor?: string;
    selectedColor?: string;
    backgroundColor?: string;
    items: ITabBarItem[];
  };
  [key: string]: unknown;
}
