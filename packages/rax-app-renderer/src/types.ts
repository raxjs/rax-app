import * as queryString from 'query-string';
import { ComponentType } from 'rax';
import type { RuntimeModule } from 'create-app-shared';

export type OnError = (err: Error, componentStack: string) => void;
export interface Context {
  pathname: string;
  path: string;
  query: queryString.ParsedQuery<string>;
  ssrError: any;
}
export interface RenderAppConfig {
  app?: {
    rootId?: string;
    mountNode?: HTMLElement;
    onErrorBoundaryHandler?: OnError;
    ErrorBoundaryFallback?: ComponentType;
    errorBoundary?: boolean;
    getInitialData?: (context: Context) => Promise<any>;
  };
  renderComponent?: ComponentType;
}
export interface AppLifecycle {
  createBaseApp: <T>(appConfig: T, buildConfig: any, context: any) => { runtime: RuntimeModule; appConfig: T };
  emitLifeCycles: () => void;
  initAppLifeCycles: () => void;
}

export interface RenderOptions<T = RenderAppConfig, P = any> {
  ErrorBoundary?: ComponentType<{Fallback?: ComponentType; onError?: Function}>;
  buildConfig: P;
  appConfig: T;
  appLifecycle: AppLifecycle;
  router?: boolean;
  pageConfig?: any;
}

export interface IContext {
  initialData?: any;
  pageInitialProps?: any;
  initialContext?: {
    pathname: string;
    query: {
      [key: string]: string;
    };
  };
}
