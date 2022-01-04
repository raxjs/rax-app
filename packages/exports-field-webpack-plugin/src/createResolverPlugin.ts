import * as path from 'path';
import processExportsField from './utils/processExportsField';
import forEachBail from './utils/forEachBail';
import parseIdentifier from './utils/parseIdentifier';
import checkExportsFieldTarget from './utils/checkExportsFieldTarget';

const fieldProcessorCache = new WeakMap();

/**
 * @param {any} resolver webpack resolver
 * @param {any} hook resolver hook
 * @param {Set} conditionNames webpack resolve conditionNames
 * @return {any} resolver plugin
 */
export default function (resolver, hook, conditionNames) {
  return (request, resolveContext, callback) => {
    // When there is no description file, abort
    if (!request.descriptionFilePath) return callback();

    if (
      // When the description file is inherited from parent, abort
      // (There is no description file inside of this package)
      request.relativePath !== '.'
    ) {
      return callback();
    }

    if (!request.request) {
      request.request = '.';
    }

    const remainingRequest =
      request.query || request.fragment
        ? (request.request === '.' ? './' : request.request) + request.query + request.fragment
        : request.request;
    const exportsField = request.descriptionFileData.exports;

    if (!exportsField) return callback();
    if (request.directory) {
      return callback(
        new Error(`Resolving to directories is not possible with the exports field (request was ${remainingRequest}/)`),
      );
    }

    let paths;

    try {
      // We attach the cache to the description file instead of the exportsField value
      // because we use a WeakMap and the exportsField could be a string too.
      // Description file is always an object when exports field can be accessed.
      let fieldProcessor = fieldProcessorCache.get(request.descriptionFileData);
      if (fieldProcessor === undefined) {
        fieldProcessor = processExportsField(exportsField);
        fieldProcessorCache.set(request.descriptionFileData, fieldProcessor);
      }
      paths = fieldProcessor(remainingRequest, conditionNames);
    } catch (err) {
      if (resolveContext.log) {
        resolveContext.log(`Exports field in ${request.descriptionFilePath} can't be processed: ${err}`);
      }
      return callback(err);
    }

    if (paths.length === 0) {
      return callback(
        new Error(
          `Package path ${remainingRequest} is not exported from package ${request.descriptionFileRoot} (see exports field in ${request.descriptionFilePath})`,
        ),
      );
    }

    forEachBail(
      paths,
      (p, forEachCallback) => {
        const parsedIdentifier = parseIdentifier(p);

        if (!parsedIdentifier) return forEachCallback();

        const [relativePath, query, fragment] = parsedIdentifier;

        const error = checkExportsFieldTarget(relativePath);

        if (error) {
          return forEachCallback(error);
        }

        const obj = {
          ...request,
          request: undefined,
          path: path.join(/** @type {string} */ request.descriptionFileRoot, relativePath),
          relativePath,
          query,
          fragment,
        };

        resolver.doResolve(hook, obj, `using exports field: ${p}`, resolveContext, forEachCallback);
      },
      (err, result) => callback(err, result || null),
    );
  };
}
