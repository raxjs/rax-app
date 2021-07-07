import * as path from 'path';
import * as fs from 'fs-extra';
import additionalContent from '../utils/additionalContent';

const libDirectory = path.join(__dirname, '../../lib');
export function beforeTransform(args, options) {
  const { files } = options;
  const transformerPath = path.join(libDirectory, 'transforms/app/project.js');
  args = args.concat(['--transform', transformerPath]);
  args.push('--app=true');
  args.push('--ignore-pattern=**/src/!(app.json|app.@(t|j)s?(x))/**');
  const rootDir = path.join(process.cwd(), files[0]);
  try {
    const pkgJSON = JSON.parse(fs.readFileSync(path.join(rootDir, 'package.json'), 'utf8'));
    const customConfigPaths = [];
    Object.keys(pkgJSON.scripts).forEach((script) => {
      const matched = pkgJSON.scripts[script].match(/build-scripts (?:start|build) --config\s(\S*)/);
      if (Array.isArray(matched) && matched[1]) {
        const configPath = path.join(rootDir, matched[1]);
        if (!customConfigPaths.includes(configPath)) {
          customConfigPaths.push(configPath);
        }
      }
    });
    customConfigPaths.forEach((customConfigPath) => {
      args.push(`--customBuildJSON=${customConfigPath}`);
    });
    // eslint-disable-next-line no-empty
  } catch (err) {}
  return {
    args,
  };
}

export function afterTransform(options) {
  const { files } = options;
  const rootDir = path.join(process.cwd(), files[0]);

  // Rewrite tsconfig.json
  fs.writeFileSync(path.join(rootDir, 'tsconfig.json'), JSON.stringify(require('../templates/tsconfig.json'), null, 2));
  // Rewrite .eslintignore
  additionalContent(path.join(rootDir, '.eslintignore'), '.rax', path.join(libDirectory, 'templates/eslintignore.txt'));

  // Rewrite .gitignore
  additionalContent(path.join(rootDir, '.gitignore'), '.rax', path.join(libDirectory, 'templates/gitignore.txt'));

  // Rewrite prettier
  fs.writeFileSync(
    path.join(rootDir, '.prettierignore'),
    fs.readFileSync(path.join(libDirectory, 'templates/prettierignore.txt')),
  );
  fs.writeFileSync(
    path.join(rootDir, 'prettierrc.js'),
    fs.readFileSync(path.join(libDirectory, 'templates/prettierrc.js')),
  );

  // Rewrite style lint
  fs.writeFileSync(
    path.join(rootDir, '.stylelintignore'),
    fs.readFileSync(path.join(libDirectory, 'templates/stylelintignore.txt')),
  );
  fs.writeFileSync(
    path.join(rootDir, 'stylelintrc.js'),
    fs.readFileSync(path.join(libDirectory, 'templates/stylelintrc.js')),
  );
}
