const path = require('path');
const loaderUtils = require('loader-utils');
const sourceMap = require('source-map');

const traverseImport = require('./TraverseImport');

/**
 * remove universal-env module dependencies
 * convert to constant
 * then use babel-plugin-minify-dead-code-elimination remove the dead code
 *
 * @example
 *
 * ../env-loader/lib/index?isWeex=true
 *
 * `import { isWeex, isWeb } from 'universal-env'`;
 *
 * after:
 *
 * ```
 * const isWeex = true;
 * const isWeb = false
 * ```
 */

async function mergeSourceMap(map, inputMap) {
  if (inputMap) {
    const inputMapConsumer = await new sourceMap.SourceMapConsumer(inputMap);
    const outputMapConsumer = await new sourceMap.SourceMapConsumer(map);

    const mergedGenerator = new sourceMap.SourceMapGenerator({
      file: inputMapConsumer.file,
      sourceRoot: inputMapConsumer.sourceRoot,
    });

    // This assumes the output map always has a single source, since Babel always compiles a
    // single source file to a single output file.
    const source = outputMapConsumer.sources[0];

    inputMapConsumer.eachMapping((mapping) => {
      const generatedPosition = outputMapConsumer.generatedPositionFor({
        line: mapping.generatedLine,
        column: mapping.generatedColumn,
        source,
      });
      if (generatedPosition.column != null) {
        mergedGenerator.addMapping({
          source: mapping.source,

          original: mapping.source == null ? null : {
            line: mapping.originalLine,
            column: mapping.originalColumn,
          },

          generated: generatedPosition,
        });
      }
    });

    const mergedMap = mergedGenerator.toJSON();
    inputMap.mappings = mergedMap.mappings;

    inputMapConsumer.destroy();
    outputMapConsumer.destroy();

    return inputMap;
  } else {
    return map;
  }
}

module.exports = async function (inputSource, inputSourceMap) {
  this.cacheable();
  const callback = this.async();

  const loaderOptions = loaderUtils.getOptions(this);
  const { resourcePath } = this;
  const sourceMapTarget = path.basename(resourcePath);

  const options = Object.assign({ name: 'universal-env', memberExpObjName: '_universalEnv' }, loaderOptions);

  if (!options.platform) {
    callback(null, inputSource);
    return;
  }

  if (!Array.isArray(options.name)) {
    options.name = [options.name];
  }

  if (!Array.isArray(options.memberExpObjName)) {
    options.memberExpObjName = [options.memberExpObjName];
  }

  const { code, map } = traverseImport(options, inputSource, {
    sourceMaps: true,
    sourceMapTarget,
    sourceFileName: resourcePath,
  });

  callback(null, code, await mergeSourceMap(map, inputSourceMap));
};
