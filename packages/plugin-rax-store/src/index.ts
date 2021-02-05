import * as path from 'path';
import * as fse from 'fs-extra';
import CodeGenerator from './generator';
import checkStoreExists from './utils/checkStoreExists';
import { getAppStorePath } from './utils/getPath';
import checkIsMpa from './utils/checkIsMpa';
import { formatPath } from '@builder/app-helpers';
import modifyStaticConfigRoutes from './utils/modifyStaticConfigRoutes';

const { name: pluginName } = require('../package.json');

export default async (api) => {
  const { context, getValue, onHook, applyMethod, onGetWebpackConfig } = api;
  const { rootDir, userConfig } = context;

  const srcDir = 'src';
  const srcPath = path.join(rootDir, srcDir);
  const tempPath = getValue('TEMP_PATH');
  const projectType = getValue('PROJECT_TYPE');

  const storeExists = checkStoreExists({ rootDir, srcDir, projectType });
  if (!storeExists) {
    applyMethod('addDisableRuntimePlugin', pluginName);
    return;
  }
  process.env.STORE_ENABLED = 'true';

  const appStoreFilePath = formatPath(getAppStorePath({ srcPath, projectType }));
  const existsAppStoreFile = fse.pathExistsSync(appStoreFilePath);

  applyMethod('addExport', { source: '@ice/store', specifier: '{ createStore }', exportName: 'createStore' });

  const mpa = checkIsMpa(userConfig);
  applyMethod('rax.modifyStaticConfig', (staticConfig) => modifyStaticConfigRoutes(staticConfig, tempPath, mpa ? 'Page.tsx' : 'Page', srcPath, projectType, mpa));

  onGetWebpackConfig((config) => {
    config.module.rule('storePageSourceLoader')
      .test(path.join(srcPath, 'app.json'))
      .use('page-source-loader')
      .loader(require.resolve('./pageSourceLoader'))
      .options({
        tempPath,
        srcPath,
        mpa,
        projectType,
      });

    // Set alias to run @ice/store
    config.resolve.alias
      .set('$store', existsAppStoreFile ? appStoreFilePath : path.join(tempPath, 'store', 'index.ts'))
      .set('react-redux', require.resolve('rax-redux'))
      .set('react', path.join(rootDir, 'node_modules', 'rax/lib/compat'));
  });

  const gen = new CodeGenerator({
    tempPath,
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
