import * as path from 'path';
import * as chalk from 'chalk';
import * as fs from 'fs-extra';
import getWebpackBase from './ssr/getBase';
import EntryPlugin from './ssr/entryPlugin';
import { NODE } from './constants';
import setDev from './ssr/setDev';

export default function (api) {
  const { onGetWebpackConfig, registerTask, context, onHook } = api;
  const {
    userConfig: { outputDir },
    rootDir,
    command,
  } = context;
  const baseConfig = getWebpackBase(api);
  registerTask('ssr', baseConfig);
  let entries = {};

  // This callback executed is before ssr onGetWebpackConfig
  onGetWebpackConfig('web', (config) => {
    const webpackConfig = config.toConfig();
    // Before set ssr entry, it need exclude document entry
    entries = webpackConfig.entry;
  });
  onGetWebpackConfig('ssr', (config) => {
    const documentPath: string = getDocumentPath(rootDir);
    config.target('node');
    // Set entry
    Object.keys(entries).forEach((entryName) => {
      config.entry(entryName).add(entries[entryName][0]);
    });

    // Set output
    const outputPath = path.join(rootDir, outputDir, NODE);
    config.output.path(outputPath).libraryTarget('commonjs2');
    config.plugin('entryPlugin').use(EntryPlugin, [
      {
        entries,
        api,
        documentPath,
      },
    ]);

    // Set server flag
    config.plugin('DefinePlugin').tap((args) => [
      Object.assign({}, ...args, {
        'process.env.__IS_SERVER__': true,
      }),
    ]);

    if (command === 'start') {
      // Set dev config
      setDev(api, config);
    }
  });

  onHook('after.build.compile', () => {
    console.log(chalk.hex('#F4AF3D')('[SSR] Bundle at:'));
    console.log('   ', chalk.underline.white(path.resolve(rootDir, outputDir, 'node')));
    console.log();
  });
}

function getDocumentPath(rootDir: string): string {
  const targetPath = path.join(rootDir, 'src/document/index');
  const targetExt = ['.jsx', '.tsx'].find((ext) => fs.existsSync(`${targetPath}${ext}`));
  if (!targetExt) return '';
  return `${targetPath}${targetExt}`;
}
