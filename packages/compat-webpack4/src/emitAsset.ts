import isWebpack4 from './isWebpack4';

export default function emitAsset(compilation, filename, source) {
  if (isWebpack4) {
    compilation.assets[filename] = source;
  } else {
    compilation.emitAsset(filename, source);
  }
}
