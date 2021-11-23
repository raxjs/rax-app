export interface IBundleShellPluginOptions {
  appType: string;
  manifest: IManifest;
}

export interface IManifest {
  appID?: string;
  pages?: string[];
  [key: string]: unknown;
}

export interface IShellOptions {
  filename: string;
}
