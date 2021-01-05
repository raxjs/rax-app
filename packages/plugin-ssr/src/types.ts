export interface IInjectedHTML {
  scripts: string[];
  links: string[];
  metas: string[];
}

export interface IEntryLoaderQuery {
  styles: string[];
  scripts: string[];
  absoluteAppConfigPath: string;
  entryPath: string;
  pagePath?: string;
  assetsProcessor?: string;
  documentPath?: string;
  builtInHTML?: string;
  injectedHTML?: IInjectedHTML;
}

