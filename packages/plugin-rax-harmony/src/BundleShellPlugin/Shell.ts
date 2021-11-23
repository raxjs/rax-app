import type { IBundleShellPluginOptions, IShellOptions } from '../types';

export default class BaseShell {
  content: string;
  pluginOptions: IBundleShellPluginOptions;
  options: IShellOptions;
  isPageFile: boolean;
  constructor(content: string, pluginOptions: IBundleShellPluginOptions, options: IShellOptions) {
    this.content = content;
    this.pluginOptions = pluginOptions;
    this.options = options;

    this.isPageFile = options.filename !== 'app.js';
  }

  generate(): string {
    // In harmony app, app.js is different from page js file
    if (this.isPageFile) return this.generatePage();
    return this.generateApp();
  }

  generatePage(): string {
    // Default return
    return this.content;
  }

  generateApp(): string {
    // Default return
    return this.content;
  }
}
