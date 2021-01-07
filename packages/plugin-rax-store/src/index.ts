import * as path from 'path';
import * as fse from 'fs-extra';
import Generator from './generator';
import checkStoreAndModelExists from './utils/checkStoreAndModelExists';
import { getAppStorePath } from './utils/getPath';
import checkIsMpa from './utils/checkIsMpa';
import modifyStaticConfigRoutes from './utils/modifyStaticConfigRoutes';

const { name: pluginName } = require('../package.json');

export default async (api) => {
  const { context, getValue, onHook, applyMethod, onGetWebpackConfig } = api;
  const { rootDir, userConfig } = context;

  const srcDir = 'src';
  const targetPath = getValue('TEMP_PATH');
  const projectType = getValue('PROJECT_TYPE');

  const storeAndModelExists = checkStoreAndModelExists({ rootDir, srcDir, projectType });
  if (!storeAndModelExists) {
    applyMethod('addDisableRuntimePlugin', pluginName);
    return;
  }

  const appStoreFilePath = applyMethod('formatPath', getAppStorePath({ rootDir, srcDir, projectType }));
  const existsAppStoreFile = fse.pathExistsSync(appStoreFilePath);

  applyMethod('addExport', { source: '@ice/store', specifier: '{ createStore }', exportName: 'createStore' });

  const mpa = checkIsMpa(userConfig);
  if (mpa) {
    const staticConfig = getValue('staticConfig');
    applyMethod('setStaticConfig', modifyStaticConfigRoutes(staticConfig, targetPath));
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
      .set('$store', existsAppStoreFile ? appStoreFilePath : path.join(targetPath, 'store', 'index.ts'))
      .set('react-redux', require.resolve('rax-redux'))
      .set('react', path.join(rootDir, 'node_modules', 'rax/lib/compat'));
  });

  const gen = new Generator({
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
