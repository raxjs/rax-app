import * as fs from 'fs-extra';

export default function getFilePath(filePath) {
  const ext = ['.ts', '.js', '.tsx', '.jsx'].find((extension) => fs.existsSync(`${filePath}${extension}`));
  if (!ext) {
    return;
  }
  return require.resolve(`${filePath}${ext}`);
}
