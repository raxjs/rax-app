import transformBuildConfig from './build.json';
import transformPkgJSON from './package.json';
import transformAppJSON from './app.json';
import transformEslint from './eslint';

export default function (fileInfo, api, options) {
  let source;
  switch (fileInfo.path) {
    case 'package.json':
      source = transformPkgJSON(fileInfo, api, options);
      break;
    case 'build.json':
      source = transformBuildConfig(fileInfo, api, options);
      break;
    case 'src/app.json':
      source = transformAppJSON(fileInfo, api, options);
      break;
    case '.eslintrc.js':
      source = transformEslint(fileInfo, api, options);
      break;
    default:
      source = fileInfo.source;
  }
  return source;
}
