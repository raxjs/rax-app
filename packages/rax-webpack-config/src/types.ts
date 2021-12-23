export interface IOptions {
  mode: 'none' | 'production' | 'development';
  rootDir: string;
  babelConfig: unknown;
  target: string;
  webpackVersion: string;
}
