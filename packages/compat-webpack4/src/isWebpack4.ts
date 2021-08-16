import * as webpack from 'webpack';

let isWebpack4;

export default function () {
  if (isWebpack4 !== undefined) return isWebpack4;
  isWebpack4 = /^4\./.test(webpack.version);
  return isWebpack4;
}
