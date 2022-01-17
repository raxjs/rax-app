import * as path from 'path';
import * as fse from 'fs-extra';
import CodeGenerator from './generator';
import { getAppStorePath, getRaxPagesPath } from './utils/getPath';
import checkExpectedStoreFileExists from './utils/checkExpectedStoreFileExists';
import checkIsMpa from './utils/checkIsMpa';
import { checkExportDefaultDeclarationExists } from '@builder/app-helpers';
import modifyStaticConfigRoutes from './utils/modifyStaticConfigRoutes';
// TODO use import declaration
const chalk = require('chalk');

const { name: pluginName } = require('../package.json');

export default async (api) => {
  const { context, getValue, onHook, applyMethod, onGetWebpackConfig } = api;
  const { rootDir, userConfig } = context;

  const srcDir = 'src';
  const srcPath = path.join(rootDir, srcDir);
  const tempPath = getValue('TEMP_PATH');

  // check if the store.[js|ts] exists in the project
  const storeExists = checkExpectedStoreFileExists(rootDir, srcDir);
  if (!storeExists) {
    applyMethod('addDisableRuntimePlugin', pluginName);
    return;
  }

  process.env.STORE_ENABLED = 'true';

  const appStorePath = getAppStorePath(srcPath);
  const pageEntries = getRaxPagesPath(rootDir);
  const mpa = checkIsMpa(userConfig);

  // set IStore to IAppConfig
  applyMethod('addAppConfigTypes', { source: '../plugins/store/types', specifier: '{ IStore }', exportName: 'store?: IStore' });

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
      });

    let raxPath;

    try {
      raxPath = require.resolve(path.join(rootDir, 'node_modules', 'rax/lib/compat'));
    } catch (e) {
      raxPath = 'rax/lib/compat';
    }

    // Set alias to run @ice/store
    config.resolve.alias
      .set('$store', fse.pathExistsSync(appStorePath) ? appStorePath : path.join(tempPath, 'plugins', 'store', 'index.ts'))
      .set('react-redux', require.resolve('rax-redux'))
      .set('react', raxPath);
  });

  const gen = new CodeGenerator({
    tempPath,
    rootDir,
    applyMethod,
    srcDir,
    pageEntries,
  });

  gen.render();

  onHook('before.start.run', async () => {
    applyMethod('watchFileChange', /models\/.*|model.*|store.*|pages\/\w+\/index(.jsx?|.tsx)/, () => {
      gen.render(true);
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
