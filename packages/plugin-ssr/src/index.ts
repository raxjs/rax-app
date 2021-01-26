import * as path from 'path';
import * as chalk from 'chalk';
import * as fs from 'fs-extra';
import { minify } from 'html-minifier';
import getWebpackBase from './ssr/getBase';
import EntryPlugin from './ssr/entryPlugin';
import { NODE, WEB } from './constants';
import setDev from './ssr/setDev';

export default function (api) {
  const { onGetWebpackConfig, registerTask, context, onHook } = api;
  const {
    userConfig: { outputDir, compileDependencies },
    rootDir,
    command,
  } = context;
  const documentPath: string = getDocumentPath(rootDir);
  const outputPath = path.join(rootDir, outputDir, NODE);
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
    config.target('node');
    // Set entry
    Object.keys(entries).forEach((entryName) => {
      const entryPaths = entries[entryName];
      config.entry(entryName).add(entryPaths[entryPaths.length - 1]);
    });

    // Set output
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

    // do not copy public
    if (config.plugins.has('CopyWebpackPlugin')) {
      config.plugins.delete('CopyWebpackPlugin');
    }

    // SSR does not compile node_modules in full
    if (compileDependencies.length === 1 && compileDependencies[0] === '') {
      ['jsx', 'tsx'].forEach((rule) => {
        config.module
          .rule(rule)
          .exclude.clear()
          .add(/node_modules/);
      });
    }

    if (command === 'start') {
      // Set dev config
      setDev(api, config);
    }
  });

  let webBuildDir;

  onHook(`before.${command}.run`, ({ config: configs }) => {
    const webConfig = configs.find((config) => config.name === WEB);
    webBuildDir = webConfig.output.path;
  });

  onHook(`after.${command}.compile`, () => {
    Object.keys(entries).forEach((entryName) => {
      const serverFilePath = path.join(outputPath, `${entryName}.js`);
      const htmlFilePath = path.join(webBuildDir, `${entryName}.html`);
      const bundle = fs.readFileSync(serverFilePath, 'utf-8');
      const html = fs.readFileSync(htmlFilePath, 'utf-8');
      const minifedHtml = minify(html, { collapseWhitespace: true, quoteCharacter: "'" });
      const newBundle = bundle.replace(/__RAX_APP_SERVER_HTML_TEMPLATE__/, minifedHtml);
      fs.writeFileSync(serverFilePath, newBundle, 'utf-8');
    });
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
