import * as qs from 'qs';

export interface IEntryPluginOptions {
  api: any;

  entries: any;
  documentPath: string;
}

export interface ILoaderQuery extends qs.ParsedQs {
  documentPath?: string;
  entryName?: string;
  needInjectStyle?: string;

  publicPath?: string;

  appConfigPath: string;

  injectedHTML?: string;
}
