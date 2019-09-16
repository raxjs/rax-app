/**
 * The inline-source-map plugin in dev mode will
 * embed the source-map information in the last line of file.
 * @param bundleContent the source code of SSR
 * @returns {Object}
 */
function getSourceMap(bundleContent) {
  const readStart = bundleContent.lastIndexOf('\n');
  const rawSourceMap = bundleContent.substr(readStart + 1);
  const headSlice = rawSourceMap.slice(0, 100);

  if (headSlice.indexOf('sourceMappingURL') < 0) {
    return null;
  }

  const base64KeyWord = 'base64,';
  const base64Start = rawSourceMap.indexOf(base64KeyWord);
  const base64 = rawSourceMap.substr(base64Start + base64KeyWord.length);

  const sourceMapString = Buffer.from(base64, 'base64').toString('utf-8');
  return JSON.parse(sourceMapString);
}

exports.getSourceMap = getSourceMap;

