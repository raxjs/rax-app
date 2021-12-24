import fs from 'fs-extra';
import path from 'path';

export default (filename, content, { rootDir }) => {
  const tempPath = path.join(rootDir, 'node_modules/.tmp/@builder');
  fs.ensureDirSync(tempPath);
  fs.writeFileSync(path.join(tempPath, filename), content);
};
