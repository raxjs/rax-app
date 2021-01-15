import * as path from 'path';
import * as fse from 'fs-extra';
import {
  getPageStorePath,
  getRaxPageName,
  getRaxPagesPath,
} from './utils/getPath';
import { formatPath } from '@builder/app-helpers';

export interface IRenderPageParams {
  pageName: string;
  pageNameDir: string;
  pageStoreFile: string;
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
      const pagePath = path.join('pages', pageName);
      const pageNameDir = path.join(this.rootDir, this.srcDir, pagePath);
      const pageStoreFile = formatPath(getPageStorePath({
        srcPath,
        pageName,
        projectType: this.projectType,
      }));
      const existedStoreFile = fse.pathExistsSync(pageStoreFile);
      // if the page store does not exist, don't generate .rax/pages/${pageName}/Page.tsx
      if (!existedStoreFile) {
        return;
      }
      const params = { pageName, pageNameDir, pageStoreFile };
      // generate .rax/pages/${pageName}/Page.tsx
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

  private renderPageComponent({ pageName, pageNameDir, pageStoreFile }: IRenderPageParams) {
    const pageComponentTemplatePath = path.join(__dirname, './template/pageComponent.tsx.ejs');
    const pageComponentTempPath = path.join(this.tempPath, 'pages', pageName, 'Page.tsx');
    const pageComponentSourcePath = this.applyMethod('formatPath', pageNameDir);

    const pageComponentName = 'PageComponent';
    const pageComponentRenderData = {
      pageComponentImport: `import ${pageComponentName} from '${pageComponentSourcePath}'`,
      pageComponentExport: pageComponentName,
      pageStoreImport: `import store from '${pageStoreFile.replace(`.${this.projectType}`, '')}'`,
    };

    this.applyMethod('addRenderFile', pageComponentTemplatePath, pageComponentTempPath, pageComponentRenderData);
  }
}
