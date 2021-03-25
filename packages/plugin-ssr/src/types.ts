export interface IEntryPluginOptions {
  api: any;

  entries: any;
  documentPath: string;

  assetsProcessor?: string;
}

export interface IPageConfig {
  path: string;
  title?: string;
}

export interface ILoaderQuery {
  documentPath?: string;
  entryName?: string;
  needInjectStyle?: boolean | string;
  useRunApp: boolean | string;
  publicPath?: string;
  tempPath: string;
  injectedHTML?: any;
  assetsProcessor?: string;
  pageConfig?: IPageConfig;
  doctype?: string;
  updateDataInClient: boolean | string;
}
