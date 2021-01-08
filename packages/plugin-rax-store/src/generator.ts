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

  private targetPath: string;

  private projectType: string;

  private applyMethod: Function;

  private srcDir: string;

  constructor({
    rootDir,
    targetPath,
    applyMethod,
    projectType,
    srcDir,
  }: {
    rootDir: string;
    targetPath: string;
    projectType: string;
    applyMethod: Function;
    srcDir: string;
  }) {
    this.rootDir = rootDir;
    this.targetPath = targetPath;
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
    const targetPath = path.join(this.targetPath, `${sourceFilename}.ts`);

    this.applyMethod('addRenderFile', appStoreTemplatePath, targetPath);
  }

  private renderAppStoreTypes() {
    const typesTemplatePath = path.join(__dirname, './template/types.ts.ejs');
    const sourceFilename = 'store/types';
    const targetPath = path.join(this.targetPath, `${sourceFilename}.ts`);

    this.applyMethod('addRenderFile', typesTemplatePath, targetPath);
    this.applyMethod('addTypesExport', { source: './store/types' });
  }

  private renderPageComponent({ pageName, pageNameDir, pageStoreFile, existedStoreFile }: IRenderPageParams) {
    const pageComponentTemplatePath = path.join(__dirname, './template/pageComponent.tsx.ejs');
    const pageComponentTargetPath = path.join(this.targetPath, 'pages', pageName, 'Page.tsx');
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

    this.applyMethod('addRenderFile', pageComponentTemplatePath, pageComponentTargetPath, pageComponentRenderData);
  }
}
