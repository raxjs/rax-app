const { resolve, join } = require('path');
const {
  copySync,
  removeSync,
  readJsonSync,
  writeJsonSync,
  moveSync
} = require('fs-extra');
const chalk = require('chalk');
const { MINIAPP } = require('../constants');
const adapter = require('../adapter');

module.exports = function(
  stats,
  customComponentConfig = {},
  { target, isFirstRender, command }
) {
  const rootDir = process.cwd();
  const customComponentRoot =
    customComponentConfig.root &&
    resolve(rootDir, customComponentConfig.root);

  const outputPath = resolve(stats.compilation.outputOptions.path);
  const distNpmDir = resolve(outputPath, target, adapter[target].npmDirName);

  const build = () => {
    ['miniapp-element', 'miniapp-render'].forEach((name) => {
      const sourceNpmFileDir = resolve(
        process.cwd(),
        'node_modules',
        name,
        'dist',
        adapter[target].fileName
      );
      const distNpmFileDir = resolve(distNpmDir, name);
      copySync(sourceNpmFileDir, distNpmFileDir);
      if (command === 'build') {
        // index.min.js overwrite index.js
        moveSync(resolve(distNpmFileDir, 'index.min.js'), resolve(distNpmFileDir, 'index.js'), { overwrite: true });
      } else {
        // Remove index.min.js
        removeSync(resolve(distNpmFileDir, 'index.min.js'));
      }
      // Handle custom-component path in alibaba miniapp
      if (
        target === MINIAPP &&
        customComponentRoot &&
        name === 'miniapp-element'
      ) {
        const elementJSONFilePath = resolve(distNpmFileDir, 'index.json');
        const elementJSONContent = readJsonSync(elementJSONFilePath);
        elementJSONContent.usingComponents['custom-component'] =
          '../../custom-component/index';
        writeJsonSync(elementJSONFilePath, elementJSONContent, { space: 2 });
      }
    });
  };

  if (isFirstRender) {
    console.log(
      chalk.green(`Start building deps for ${adapter[target].name}...`)
    );
    build();
  }
};
