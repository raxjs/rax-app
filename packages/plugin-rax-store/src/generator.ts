import * as path from 'path';
import * as fse from 'fs-extra';
import { formatPath, checkExportDefaultDeclarationExists } from '@builder/app-helpers';
import { getPageStorePath, getRaxPageName } from './utils/getPath';
// TODO use import declaration
const chalk = require('chalk');

export interface IRenderPageParams {
  pageStoreFile: string;
  pageEntry: string;
  pageComponentPath: string;
}

export default class Generator {
  private rootDir: string;

  private tempPath: string;

  private applyMethod: Function;

  private srcDir: string;

  private pageEntries: string[];

  constructor({
    rootDir,
    tempPath,
    applyMethod,
    srcDir,
    pageEntries,
  }: {
    rootDir: string;
    tempPath: string;
    applyMethod: Function;
    srcDir: string;
    pageEntries: string[];
  }) {
    this.rootDir = rootDir;
    this.tempPath = tempPath;
    this.applyMethod = applyMethod;
    this.srcDir = srcDir;
    this.pageEntries = pageEntries;
  }

  render() {
    // generate .rax/store/index.ts
    this.renderAppStoreIndex();
    // generate .rax/store/types.ts
    this.renderAppStoreTypes();

    const srcPath = path.join(this.rootDir, this.srcDir);

    this.pageEntries.forEach((pageEntry) => {
      const pageName = getRaxPageName(pageEntry);
      const pageComponentPath = path.join(this.rootDir, this.srcDir, pageEntry);
      const pageStoreFile = getPageStorePath(srcPath, pageName);

      // don't generate .rax/pages/Home/index.tsx
      // 1. the page store does not exist
      // 2. the entry has no `export default`
      if (!fse.pathExistsSync(pageStoreFile)) {
        return;
      } else if (!checkExportDefaultDeclarationExists(pageComponentPath)) {
        console.log(chalk.yellow(
          chalk.black.bgYellow(' WARNING '),
          `The page entry ${pageComponentPath} will not be wrapped <store.Provider> by framework. Please wrap the <store.Provider> in this page by yourself. For more detail, please see https://rax.js.org/docs/guide/store.`,
        ));
        return;
      }
      const params = {
        pageStoreFile,
        pageEntry,
        pageComponentPath,
      };
      // generate .rax/pages/Home/index.tsx
      this.renderPageComponent(params);
    });
  }

  private renderAppStoreIndex() {
    const appStoreTemplatePath = path.join(__dirname, './template/appIndex.ts.ejs');
    const sourceFilename = 'store/index';
    const tempPath = path.join(this.tempPath, `${sourceFilename}.ts`);

    this.applyMethod('addRenderFile', appStoreTemplatePath, tempPath);
  }

  private renderAppStoreTypes() {
    const typesTemplatePath = path.join(__dirname, './template/types.ts.ejs');
    const sourceFilename = 'store/types';
    const tempPath = path.join(this.tempPath, `${sourceFilename}.ts`);

    this.applyMethod('addRenderFile', typesTemplatePath, tempPath);
    this.applyMethod('addTypesExport', { source: './store/types' });
  }

  private renderPageComponent({ pageStoreFile, pageEntry, pageComponentPath }: IRenderPageParams) {
    const pageComponentTemplatePath = path.join(__dirname, './template/pageComponent.tsx.ejs');
    // e.g.: generate .rax/pages/Home/myIndex.tsx
    const pageComponentTempPath = path.join(this.tempPath, `${pageEntry}.tsx`);
    const pageComponentSourcePath = formatPath(pageComponentPath);

    const pageComponentName = 'PageComponent';
    const pageStoreExtname = path.extname(pageStoreFile);
    const pageComponentRenderData = {
      pageComponentImport: `import ${pageComponentName} from '${pageComponentSourcePath}'`,
      pageComponentExport: pageComponentName,
      pageStoreImport: `import store from '${pageStoreFile.replace(pageStoreExtname, '')}'`,
    };

    this.applyMethod('addRenderFile', pageComponentTemplatePath, pageComponentTempPath, pageComponentRenderData);
  }
}
