import * as path from 'path';
import * as fse from 'fs-extra';
import Generator from './generator';
import checkStoreAndModelExists from './utils/checkStoreAndModelExists';
import { getAppStorePath } from './utils/getPath';

const { name: pluginName } = require('../package.json');

export default async (api) => {
  const { context, getValue, onHook, applyMethod, onGetWebpackConfig } = api;
  const { rootDir } = context;

  const srcDir = 'src';
  const targetPath = getValue('TEMP_PATH');
  const templatePath = path.join(__dirname, 'template');
  const appStoreTemplatePath = path.join(templatePath, 'appStore.ts.ejs');
  const pageStoreTemplatePath = path.join(templatePath, 'pageStore.ts.ejs');
  const pageStoresTemplatePath = path.join(templatePath, 'pageStores.ts.ejs');
  const typesTemplatePath = path.join(templatePath, 'types.ts.ejs');
  const projectType = getValue('PROJECT_TYPE');

  const storeAndModelExists = checkStoreAndModelExists({ rootDir, srcDir, projectType });
  if (!storeAndModelExists) {
    applyMethod('addDisableRuntimePlugin', pluginName);
    return;
  }

  const appStoreFile = applyMethod('formatPath', getAppStorePath({ rootDir, srcDir, projectType }));
  const existsAppStoreFile = fse.pathExistsSync(appStoreFile);

  applyMethod('addExport', { source: '@ice/store', specifier: '{ createStore }', exportName: 'createStore' });

  if (!existsAppStoreFile) {
    // set IStore to IAppConfig
    applyMethod('addAppConfigTypes', { source: './store/types', specifier: '{ IStore }', exportName: 'store?: IStore' });
  }

  onGetWebpackConfig((config) => {
    config.module.rule('appJSON')
      .test(/app\.json$/)
      .use('page-source-loader')
      .loader(require.resolve('./pageSourceLoader'))
      .options({
        targetPath,
      });

    // Set alias to run @ice/store
    config.resolve.alias
      .set('$store', existsAppStoreFile ? appStoreFile : path.join(targetPath, 'store', 'index.ts'))
      .set('react-redux', require.resolve('rax-redux'))
      .set('react', path.join(rootDir, 'node_modules', 'rax/lib/compat'));
  });

  const gen = new Generator({
    appStoreTemplatePath,
    pageStoreTemplatePath,
    pageStoresTemplatePath,
    typesTemplatePath,
    targetPath,
    rootDir,
    applyMethod,
    projectType,
    srcDir,
  });

  gen.render();

  onHook('before.start.run', async () => {
    applyMethod('watchFileChange', /models\/.*|model.*|pages\/\w+\/index(.jsx?|.tsx)/, () => {
      gen.render();
    });
  });
};
