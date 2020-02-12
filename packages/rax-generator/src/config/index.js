const promptQuestion = [
  {
    type: 'list',
    name: 'projectType',
    message: 'What\'s your project type?',
    choices: [
      {
        name: 'App (Build universal application)',
        value: 'app',
      },
      {
        name: 'Component (Build universal component)',
        value: 'component',
      },
      {
        name: 'API (Build universal API library)',
        value: 'api',
      },
    ],
    default: 'app',
  },
  {
    type: 'input',
    name: 'projectAuthor',
    message: 'What\'s author\'s name?',
    default: 'rax',
  },
  {
    type: 'list',
    name: 'appType',
    message: 'What\'s your application type?',
    when(answers) {
      return answers.projectType === 'app';
    },
    choices: [
      {
        name: 'Single-page application (SPA)',
        value: 'spa',
      },
      {
        name: 'Multi-page application (MPA)',
        value: 'mpa',
      },
      {
        name: 'Create lite application (The simplest project setup)',
        value: 'lite',
      },
    ],
    default: 'spa',
  },
  {
    type: 'list',
    name: 'languageType',
    message: 'What type of language do you want to use?',
    choices: [
      {
        name: 'JavaScript',
        value: 'js',
      },
      {
        name: 'TypeScript',
        value: 'ts',
      },
    ],
    default: 'js',
  },
  {
    type: 'list',
    name: 'componentType',
    message: 'What\'s your component type?',
    when(answers) {
      return answers.projectType === 'component';
    },
    choices: [
      {
        name: 'Create base component (A simple component which can support miniapp)',
        value: 'base',
      },
      {
        name: 'Create UI component (A UI component which contains multi-theme solution)',
        value: 'ui',
      },
    ],
    default: 'base',
  },
  {
    type: 'checkbox',
    name: 'projectTargets',
    validate(targets) {
      if (targets && targets.length > 0) return true;
      return 'Choose at least one of target.';
    },
    message: 'Choose targets your project want to run?',
    choices: [
      {
        name: 'Web',
        value: 'web',
      },
      {
        name: 'Weex',
        value: 'weex',
      },
      {
        name: 'Alibaba MiniApp',
        value: 'miniapp',
      },
      {
        name: 'WeChat MiniProgram',
        value: 'wechat-miniprogram',
      },
      {
        name: 'Kraken (Flutter)',
        value: 'kraken',
      },
    ],
    default: ['web'],
  },
  {
    type: 'checkbox',
    name: 'projectFeatures',
    when(answers) {
      return answers.projectType === 'app';
    },
    message: 'Do you want to enable these features?',
    choices: [
      {
        name: 'Server-side rendering (SSR)',
        value: 'ssr',
        disabled: (answers) => {
          // Lite app is not support SSR
          return (
            answers.appType === 'lite' ||
            !answers.projectTargets.includes('web')
          );
        },
      },
      {
        name: 'Aliyun Function Compute (FaaS)',
        value: 'faas',
      },
      {
        name: 'Compatibility with React',
        value: 'react',
      },
    ],
    default: false,
  },
  {
    type: 'input',
    name: 'projectAliyunId',
    message: 'What\'s your aliyun account id?',
    when(answers) {
      const features = answers.projectFeatures;
      return features && features.includes('faas');
    },
    validate(val) {
      if (val && val.trim()) return true;
      return 'Input your aliyun account id.';
    },
    default: '',
  },
  {
    type: 'input',
    name: 'projectAliyunRegion',
    message: 'What\'s your aliyun region?',
    when(answers) {
      const features = answers.projectFeatures;
      return features && features.includes('faas');
    },
    validate(val) {
      if (val && val.trim()) return true;
      return 'Input your aliyun region.';
    },
    default: 'cn-hangzhou',
  },
  {
    type: 'confirm',
    name: 'autoInstallModules',
    message: 'Do you want to install dependences automatically after initialization?',
    default: 'y',
  },
];

module.exports = {
  promptQuestion,
};
