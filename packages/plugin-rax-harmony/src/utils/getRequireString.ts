import * as loaderUtils from 'loader-utils';

export default function getRequireString(loaderContext, loader, filepath) {
  return `require(${
    loaderUtils.stringifyRequest(
      loaderContext,
      loader ?
        `!!${loader}!${filepath}` :
        `${filepath}`,
    )
  })\n`;
}
