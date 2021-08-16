import * as webpack from 'webpack';
import isWebpack4 from './isWebpack4';

const { Compilation } = webpack;

interface IProcessAssetsResult {
  compilation: any;
  assets: any;
  callback: Function;
}

type ProcessAssetsCallback = (processAssetsResult: IProcessAssetsResult) => void;

export default function ({ pluginName, compiler }, callback: ProcessAssetsCallback) {
  if (isWebpack4()) {
    compiler.hooks.emit.tapAsync(pluginName, async (compilation, hookCallback) => {
      callback({
        compilation,
        assets: compilation.assets,
        callback: hookCallback,
      });
    });
  } else {
    compiler.hooks.thisCompilation.tap(pluginName, (compilation) => {
      compilation.hooks.processAssets.tapAsync(
        {
          name: pluginName,
          stage: Compilation.PROCESS_ASSETS_STAGE_REPORT,
        },
        (assets, hookCallback) => {
          callback({
            compilation,
            assets,
            callback: hookCallback,
          });
        },
      );
    });
  }
}
