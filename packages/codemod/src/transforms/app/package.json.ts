const depDeleteList = ['rax-app'];
const devDepDeleteList = [
  '@alib/build-scripts',
  'babel-eslint',
  'build-plugin-rax-app',
  'eslint-config-rax',
  'eslint-plugin-import',
  'eslint-plugin-module',
  'eslint-plugin-react',
  'build-plugin-rax-multi-pages',
  'build-plugin-rax-ssr',
  'build-plugin-rax-pwa',
];

const devAddDepList = [
  {
    name: '@types/rax',
    version: '^1.0.0',
  },
  {
    name: '@iceworks/spec',
    version: '^1.0.0',
  },
  {
    name: 'prettier',
    version: '^2.0.0',
  },
  {
    name: 'stylelint',
    version: '^13.0.0',
  },
  {
    name: 'rax-app',
    version: '^3.0.0',
  },
];

const updateDevList = [
  {
    name: '@ali/build-plugin-rax-faas',
    version: '^4.0.0',
  },
  {
    name: '@ali/build-plugin-rax-app-def',
    version: '^3.0.0',
  },
  {
    name: 'build-plugin-rax-compat-react',
    version: '^1.0.0',
  },
];

const extraScripts = [
  {
    name: 'eslint',
    command: 'eslint --ext .js,.jsx ./',
  },
  {
    name: 'stylelint',
    command: 'stylelint "**/*.{css,scss,less}"',
  },
  {
    name: 'prettier',
    command: 'prettier **/* --write',
  },
  {
    name: 'lint',
    command: 'npm run eslint && npm run stylelint',
  },
];

export default function (fileInfo) {
  const pkg = JSON.parse(fileInfo.source);
  depDeleteList.forEach((pkgName) => delete pkg.dependencies[pkgName]);
  devDepDeleteList.forEach((pkgName) => delete pkg.devDependencies[pkgName]);
  devAddDepList.forEach(({ name, version }) => {
    pkg.devDependencies[name] = version;
  });
  updateDevList.forEach(({ name, version }) => {
    if (pkg.devDependencies[name]) {
      pkg.devDependencies[name] = version;
    }
  });

  Object.keys(pkg.scripts).forEach((command) => {
    pkg.scripts[command] = pkg.scripts[command]
      .replace('build-scripts build', 'rax-app build')
      .replace('build-scripts start', 'rax-app start');
  });

  extraScripts.forEach(({ name, command }) => {
    if (!pkg.scripts[name]) {
      pkg.scripts[name] = command;
    }
  });

  return JSON.stringify(pkg, null, 2);
}
