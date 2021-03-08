const depDeleteList = ['rax-app'];
const devDepDeleteList = [
  '@alib/build-scripts',
  'babel-eslint',
  'build-plugin-rax-app',
  'eslint-config-rax',
  'eslint-plugin-import',
  'eslint-plugin-module',
  'eslint-plugin-react',
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

export default function (fileInfo, api, options) {
  const pkg = JSON.parse(fileInfo.source);
  depDeleteList.forEach((pkgName) => delete pkg.dependencies[pkgName]);
  devDepDeleteList.forEach((pkgName) => delete pkg.devDependencies[pkgName]);
  devAddDepList.forEach(({ name, version }) => {
    pkg[name] = version;
  });

  return JSON.stringify(pkg, null, 2);
}
