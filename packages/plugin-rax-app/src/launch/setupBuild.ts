import path from 'path';
import formatWebpackMessages from 'react-dev-utils/formatWebpackMessages';
import chalk from 'chalk';
import { platformMap } from 'miniapp-builder-shared';

import {
  MINIAPP_PLATFORMS,
  WEB,
  WEEX,
  KRAKEN,
} from '../constants';

const highlightPrint = chalk.hex('#F4AF3D');
const logWebpackConfig = require('./utils/logWebpackConfig');

export default (api) => {
  const { context, onHook } = api;
  const { rootDir } = context;

  onHook('before.build.run', ({ config: configs }) => {
    logWebpackConfig(configs);
  });

  onHook('after.build.compile', ({ stats }) => {
    const { userConfig } = context;
    const statsJson = stats.toJson({
      all: false,
      errors: true,
      warnings: true,
      timings: true,
    });
    const messages = formatWebpackMessages(statsJson);
    // Do not print localUrl and assets information when containing an error
    const isSuccessful = !messages.errors.length;
    const { outputDir = 'build', targets } = userConfig;
    if (isSuccessful) {
      console.log(highlightPrint('Build finished:'));
      console.log();

      if (targets.includes(WEB)) {
        console.log(highlightPrint('[Web] Bundle at:'));
        console.log(
          '   ',
          chalk.underline.white(path.resolve(rootDir, outputDir, WEB)),
        );
        console.log();
      }

      if (targets.includes(WEEX)) {
        console.log(highlightPrint('[Weex] Bundle at:'));
        console.log(
          '   ',
          chalk.underline.white(path.resolve(rootDir, outputDir, WEEX)),
        );
        console.log();
      }

      if (targets.includes(KRAKEN)) {
        console.log(highlightPrint('[Kraken] Bundle at:'));
        console.log(
          '   ',
          chalk.underline.white(path.resolve(rootDir, outputDir, KRAKEN)),
        );
        console.log();
      }

      MINIAPP_PLATFORMS.forEach((miniappPlatform) => {
        if (targets.includes(miniappPlatform)) {
          console.log(highlightPrint(`[${platformMap[miniappPlatform].name}] Bundle at:`));
          console.log(
            '   ',
            chalk.underline.white(path.resolve(rootDir, outputDir, miniappPlatform)),
          );
          console.log();
        }
      });
    }
  });
};

