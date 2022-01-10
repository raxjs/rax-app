import * as path from 'path';
import * as fs from 'fs-extra';

export default function copyRemoteDist(targets: string[], outputDir: string) {
  targets.forEach(target => {
    const sourceDir = path.resolve(outputDir, `webview-${target}`);
    const destDir = path.resolve(outputDir, target);

    if (fs.pathExistsSync(sourceDir) && fs.pathExistsSync(destDir)) {
      fs.copySync(sourceDir, destDir);
      fs.removeSync(sourceDir);
    }
  });
}