import * as path from 'path';
import * as fse from 'fs-extra';
import {
  getPageStorePath,
  getRaxPageName,
  getRaxPagesPath,
} from './utils/getPath';
import { formatPath, checkExportDefaultDeclarationExists } from '@builder/app-helpers';

export interface IRenderPageParams {
  pageStoreFile: string;
  pageEntry: string;
  pageComponentPath: string;
}

export default class Generator {
  private rootDir: string;

  private tempPath: string;

  private projectType: string;

  private applyMethod: Function;

  private srcDir: string;

  constructor({
    rootDir,
    tempPath,
    applyMethod,
    projectType,
    srcDir,
  }: {
    rootDir: string;
    tempPath: string;
    projectType: string;
    applyMethod: Function;
    srcDir: string;
  }) {
    this.rootDir = rootDir;
    this.tempPath = tempPath;
    this.applyMethod = applyMethod;
    this.projectType = projectType;
    this.srcDir = srcDir;
  }

  render() {
    // generate .rax/store/index.ts
    this.renderAppStoreIndex();
    // generate .rax/store/types.ts
    this.renderAppStoreTypes();

    const pageEntries = getRaxPagesPath(this.rootDir);
    const srcPath = path.join(this.rootDir, this.srcDir);

    pageEntries.forEach((pageEntry) => {
      const pageName = getRaxPageName(pageEntry);
      const pageComponentPath = path.join(this.rootDir, this.srcDir, pageEntry);
      const pageStoreFile = formatPath(getPageStorePath({
        srcPath,
        pageName,
        projectType: this.projectType,
      }));
      const existedStoreFile = fse.pathExistsSync(pageStoreFile);
      if (!existedStoreFile || !checkExportDefaultDeclarationExists(pageComponentPath)) {
        // don't generate .rax/pages/Home/index.tsx
        // 1. the page store does not exist
        // 2. the entry has no `export default`
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
    const pageComponentTempPath = path.join(this.tempPath, `${pageEntry}.${this.projectType}x`);
    const pageComponentSourcePath = formatPath(pageComponentPath);

    const pageComponentName = 'PageComponent';
    const pageComponentRenderData = {
      pageComponentImport: `import ${pageComponentName} from '${pageComponentSourcePath}'`,
      pageComponentExport: pageComponentName,
      pageStoreImport: `import store from '${pageStoreFile.replace(`.${this.projectType}`, '')}'`,
    };

    this.applyMethod('addRenderFile', pageComponentTemplatePath, pageComponentTempPath, pageComponentRenderData);
  }
}
