import * as path from 'path';
import * as fse from 'fs-extra';
import * as chalk from 'chalk';
import CodeGenerator from './generator';
import { getAppStorePath, getRaxPagesPath } from './utils/getPath';
import checkExpectedStoreFileExists from './utils/checkExpectedStoreFileExists';
import checkIsMpa from './utils/checkIsMpa';
import { checkExportDefaultDeclarationExists, formatPath } from '@builder/app-helpers';
import modifyStaticConfigRoutes from './utils/modifyStaticConfigRoutes';

const { name: pluginName } = require('../package.json');

export default async (api) => {
  const { context, getValue, onHook, applyMethod, onGetWebpackConfig } = api;
  const { rootDir, userConfig } = context;

  const srcDir = 'src';
  const srcPath = path.join(rootDir, srcDir);
  const tempPath = getValue('TEMP_PATH');
  const projectType = getValue('PROJECT_TYPE');

  const storeExists = checkExpectedStoreFileExists({ rootDir, srcDir, projectType });
  if (!storeExists) {
    applyMethod('addDisableRuntimePlugin', pluginName);
    return;
  }
  process.env.STORE_ENABLED = 'true';

  const appStoreFilePath = formatPath(getAppStorePath({ srcPath, projectType }));
  const existsAppStoreFile = fse.pathExistsSync(appStoreFilePath);
  const pageEntries = getRaxPagesPath(rootDir);
  const mpa = checkIsMpa(userConfig);

  applyMethod('addExport', {
    source: '@ice/store',
    specifier: '{ createStore }',
    exportName: 'createStore',
    importSource: '@ice/store',
    exportMembers: ['createStore'],
  });

  applyMethod(
    'rax.modifyStaticConfig',
    (staticConfig) => modifyStaticConfigRoutes(
      staticConfig,
      tempPath,
      srcPath,
      projectType,
      mpa,
    ),
  );

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
    pageEntries,
  });

  gen.render();

  onHook('before.start.run', async () => {
    applyMethod('watchFileChange', /models\/.*|model.*|pages\/\w+\/index(.jsx?|.tsx)/, () => {
      gen.render();
    });

    applyMethod('watchFileChange', /store.*/, (event: string, filePath: string) => {
      if (event === 'add') {
        if (mpa) {
          const relativePagePath = path.dirname(path.relative(srcPath, filePath));
          if (!shouldRestartDevServer(relativePagePath)) {
            return;
          }
        }
        // restart WDS
        console.log('\n');
        console.log(chalk.magenta(`${filePath} has been created`));
        console.log(chalk.magenta('restart dev server'));
        process.send({ type: 'RESTART_DEV' });
      }
    });
  });

  function shouldRestartDevServer(pagePath) {
    const currentPageEntry = pageEntries.find((pageEntry) => pageEntry.includes(pagePath));
    if (currentPageEntry) {
      const exportDefaultDeclarationExists = checkExportDefaultDeclarationExists(path.join(srcPath, currentPageEntry));
      if (exportDefaultDeclarationExists) {
        return true;
      }
    }
    return false;
  }
};
