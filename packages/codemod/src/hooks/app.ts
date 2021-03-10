import * as path from 'path';
import * as fs from 'fs-extra';
import additionalContent from '../utils/additionalContent';

const libDirectory = path.join(__dirname, '../../lib');
export function beforeTransform(args) {
  const transformerPath = path.join(libDirectory, 'transforms/app/project.js');
  args = args.concat(['--transform', transformerPath]);
  args.push('--app=true');
  args.push('--ignore-pattern=**/src/!(app.json|app.@(t|j)s?(x))/**');
  return {
    args,
  };
}

export function afterTransform(options) {
  const { files } = options;
  const rootDir = path.join(process.cwd(), files[0]);

  // Rewrite tsconfig.json
  fs.writeFileSync(
    path.join(rootDir, 'tsconfig.json'),
    JSON.stringify(require('../templates/tsconfig.json'), null, 2),
  );
  // Rewrite .eslintignore
  additionalContent(
    path.join(rootDir, '.eslintignore'),
    '.rax',
    path.join(libDirectory, 'templates/eslintignore.txt'),
  );

  // Rewrite .gitignore
  additionalContent(path.join(rootDir, '.gitignore'), '.rax', path.join(libDirectory, 'templates/gitignore.txt'));
}
