import loaderUtils from 'loader-utils';
import path from 'path';
import sourceMap from 'source-map';
import traverseImport from './TraverseImport';
/**
 * remove universal-env module dependencies
 * convert to constant
 * then use babel-plugin-minify-dead-code-elimination remove the dead code
 *
 * @example
 *
 * ../evn-loader/lib/index?isWeex=true
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

function mergeSourceMap(map, inputMap) {
  if (inputMap) {
    var inputMapConsumer = new sourceMap.SourceMapConsumer(inputMap);
    var outputMapConsumer = new sourceMap.SourceMapConsumer(map);
    var mergedGenerator = new sourceMap.SourceMapGenerator({
      file: inputMapConsumer.file,
      sourceRoot: inputMapConsumer.sourceRoot
    }); // This assumes the output map always has a single source, since Babel always compiles a
    // single source file to a single output file.

    var source = outputMapConsumer.sources[0];
    inputMapConsumer.eachMapping(function (mapping) {
      var generatedPosition = outputMapConsumer.generatedPositionFor({
        line: mapping.generatedLine,
        column: mapping.generatedColumn,
        source: source
      });

      if (generatedPosition.column != null) {
        mergedGenerator.addMapping({
          source: mapping.source,
          original: mapping.source == null ? null : {
            line: mapping.originalLine,
            column: mapping.originalColumn
          },
          generated: generatedPosition
        });
      }
    });
    var mergedMap = mergedGenerator.toJSON();
    inputMap.mappings = mergedMap.mappings;
    return inputMap;
  } else {
    return map;
  }
}

module.exports = function (inputSource, inputSourceMap) {
  this.cacheable();
  var callback = this.async();
  var loaderOptions = loaderUtils.getOptions(this);
  var resourcePath = this.resourcePath;
  var sourceMapTarget = path.basename(resourcePath);
  var options = Object.assign({
    name: 'universal-env'
  }, loaderOptions);

  if (!Array.isArray(options.name)) {
    options.name = [options.name];
  }

  var _traverseImport = traverseImport(options, inputSource, {
    sourceMaps: true,
    sourceMapTarget: sourceMapTarget,
    sourceFileName: resourcePath
  }),
      code = _traverseImport.code,
      map = _traverseImport.map;

  callback(null, code, mergeSourceMap(map, inputSourceMap));
};