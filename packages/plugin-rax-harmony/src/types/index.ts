export interface IRequireModulePluginOptions {
  appType: string;
}

export interface IAppWorkerLoaderOptions {
  appType: string;
  manifest: string;
}

export interface ILoadAppDefineOptions extends IAppWorkerLoaderOptions {
  code: string;
}
