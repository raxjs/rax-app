import * as path from 'path';
import transformBuildConfig from './build.json';
import transformPkgJSON from './package.json';
import transformAppJSON from './app.json';
import transformEslint from './eslint';
import transformAppEntry from './transformAppEntry';

export default function (fileInfo, api, options) {
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
    case 'src/app.js':
    case 'src/app.jsx':
    case 'src/app.ts':
    case 'src/app.tsx':
      source = transformAppEntry(fileInfo, api);
      break;
    case '.eslintrc.js':
      source = transformEslint();
      break;
    default:
      if (options.customBuildJSON) {
        const absolutePath = path.resolve(process.cwd(), fileInfo.path);
        if (Array.isArray(options.customBuildJSON) && options.customBuildJSON.includes(absolutePath)) {
          source = transformBuildConfig(fileInfo);
        } else if (options.customBuildJSON === absolutePath) {
          source = transformBuildConfig(fileInfo);
        }
      } else {
        source = fileInfo.source;
      }
  }

  return source;
}
