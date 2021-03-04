import * as fs from 'fs';
import * as path from 'path';
import { formatPath } from '@builder/app-helpers';

function moduleResolve(filePath) {
  const ext = ['.ts', '.js', '.tsx', '.jsx'].find((extension) => fs.existsSync(`${filePath}${extension}`));
  if (!ext) {
    throw new Error(`Cannot find target file ${filePath}.`);
  }
  return require.resolve(`${filePath}${ext}`);
}

export default function (rootDir) {
  return moduleResolve(formatPath(path.join(rootDir, './src/app')));
}
