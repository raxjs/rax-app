import transformBuildConfig from './build.json';
import transformPkgJSON from './package.json';
import transformAppJSON from './app.json';
import transformEslint from './eslint';

export default function (fileInfo) {
  let source;
  switch (fileInfo.path) {
    case 'package.json':
      source = transformPkgJSON(fileInfo);
      break;
    case 'build.json':
      source = transformBuildConfig(fileInfo);
      break;
    case 'src/app.json':
      source = transformAppJSON(fileInfo);
      break;
    case '.eslintrc.js':
      source = transformEslint();
      break;
    default:
      source = fileInfo.source;
  }
  return source;
}
