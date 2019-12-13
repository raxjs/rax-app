const promptQuestion = [
  {
    type: 'list',
    name: 'projectType',
    message: 'What\'s your project type?',
    choices: [
      {
        name: 'App (Build application that works multi-platform)',
        value: 'scaffold',
      },
      {
        name: 'Component (Build component for application include web)',
        value: 'component',
      },
      {
        name: 'API (Build universal API library)',
        value: 'api',
      },
    ],
    default: 'scaffold',
  },
  {
    type: 'list',
    name: 'scaffoldType',
    message: 'What\'s your application type?',
    when(answers) {
      return answers.projectType === 'scaffold';
    },
    choices: [
      {
        name: 'Standard SPA App (The complete solution for single-page application that works multi-platform)',
        value: 'spa-standard',
      },
      {
        name: 'Standard MPA App (The complete solution for multi-page application that works multi-platform)',
        value: 'mpa-standard',
      },
      {
        name: 'Lite App (The simplest possible setup)',
        value: 'lite',
      },
    ],
    default: 'standard',
  },
  {
    type: 'checkbox',
    name: 'projectTargets',
    when(answers) {
      return (answers.projectType === 'scaffold' && (answers.scaffoldType === 'spa-standard' || answers.scaffoldType === 'mpa-standard')) || answers.projectType === 'component';
    },
    validate(targets) {
      if (targets && targets.length > 0) return true;
      return 'Choose at least one of target.';
    },
    message: 'Do you want to build to these targets?',
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
        name: 'Kraken',
        value: 'kraken',
      },
      {
        name: 'MiniApp',
        value: 'miniapp',
      },
      {
        name: 'WeChat MiniProgram',
        value: 'wechat-miniprogram',
      },
    ],
    default: false,
  },
  {
    type: 'checkbox',
    name: 'projectFeatures',
    when(answers) {
      return answers.projectType === 'scaffold';
    },
    message: 'Do you want to enable these features?',
    choices: [
      {
        name: 'server side rendering (ssr)',
        value: 'ssr',
        disabled: (answers) => {
          // Lite app is not support SSR
          return answers.scaffoldType === 'lite' || !answers.projectTargets.includes('web');
        },
      },
      {
        name: 'serverless solution (FaaS)',
        value: 'serverless',
      },
    ],
    default: false,
  },
  {
    type: 'input',
    name: 'projectAuthor',
    message: 'What\'s author\'s name?',
    default: 'rax',
  },
  {
    type: 'input',
    name: 'projectAliyunId',
    message: 'What\'s alibaba cloud account id?',
    when(answers) {
      const features = answers.projectFeatures;
      return features && features.includes('serverless');
    },
    validate(val) {
      if (val && val.trim()) return true;
      return 'Input your alibaba cloud account id.';
    },
    default: '',
  },
  {
    type: 'input',
    name: 'projectServerlessRegion',
    message: 'What\'s serverless region?',
    when(answers) {
      const features = answers.projectFeatures;
      return features && features.includes('serverless');
    },
    validate(val) {
      if (val && val.trim()) return true;
      return 'Input your serverless region.';
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
