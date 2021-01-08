import * as path from 'path';
import * as fse from 'fs-extra';
import {
  getPageStorePath,
  getRaxPageName,
  getRaxPagesPath,
} from './utils/getPath';

export interface IRenderPageParams {
  pageName: string;
  pageNameDir: string;
  pageStoreFile: string;
  existedStoreFile: boolean;
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
    const pageEntries = getRaxPagesPath(this.rootDir);

    pageEntries.forEach((pageEntry) => {
      const pageName = getRaxPageName(pageEntry);
      const pagePath = path.join('pages', pageName);
      const pageNameDir = path.join(this.rootDir, this.srcDir, pagePath);
      const pageStoreFile = this.applyMethod('formatPath', getPageStorePath({
        rootDir: this.rootDir,
        srcDir: this.srcDir,
        pageName,
        projectType: this.projectType,
      }));
      const existedStoreFile = fse.pathExistsSync(pageStoreFile);
      const params = { pageName, pageNameDir, pageStoreFile, existedStoreFile };

      // generate .rax/store/index.ts
      this.renderAppStoreIndex();
      // generate .rax/store/types.ts
      this.renderAppStoreTypes();
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

  private renderPageComponent({ pageName, pageNameDir, pageStoreFile, existedStoreFile }: IRenderPageParams) {
    const pageComponentTemplatePath = path.join(__dirname, './template/pageComponent.tsx.ejs');
    const pageComponentTempPath = path.join(this.tempPath, 'pages', pageName, 'Page.tsx');
    const pageComponentSourcePath = this.applyMethod('formatPath', pageNameDir);

    const pageComponentName = 'PageComponent';
    const pageComponentRenderData = {
      pageComponentImport: `import ${pageComponentName} from '${pageComponentSourcePath}'`,
      pageComponentExport: pageComponentName,
      hasPageStore: false,
      pageStoreImport: existedStoreFile ? `import store from '${pageStoreFile.replace(`.${this.projectType}`, '')}'` : 'import store from \'./store\'',
    };

    if (existedStoreFile) {
      pageComponentRenderData.hasPageStore = true;
    }

    this.applyMethod('addRenderFile', pageComponentTemplatePath, pageComponentTempPath, pageComponentRenderData);
  }
}
