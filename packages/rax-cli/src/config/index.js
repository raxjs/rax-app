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
        name: 'FaaS App (Build application with FaaS)',
        value: 'faas',
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
    type: 'checkbox',
    name: 'projectTargets',
    when(answers) {
      return answers.projectType === 'scaffold' || answers.projectType === 'component' || answers.projectType === 'faas';
    },
    validate(targets) {
      if (targets && targets.length > 0) return true;
      return 'Choose at least one of target.';
    },
    message: 'Do you want to build to these targets?',
    choices: [
      {
        name: 'web',
        value: 'web',
      },
      {
        name: 'weex',
        value: 'weex',
      },
      {
        name: 'miniapp',
        value: 'miniapp',
      },
    ],
    default: false,
  },
  {
    type: 'checkbox',
    name: 'projectFeatures',
    when(answers) {
      return (answers.projectType === 'scaffold' || answers.projectType === 'faas') && answers.projectTargets.includes('web');
    },
    message: 'Do you want to enable these features?',
    choices: [
      {
        name: 'server side rendering (ssr)',
        value: 'ssr',
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
      return answers.projectType === 'faas';
    },
    validate(val) {
      if (val && val.trim()) return true;
      return 'Input your alibaba cloud account id.';
    },
    default: '',
  },
  {
    type: 'input',
    name: 'projectFaasRegion',
    message: 'What\'s FaaS region?',
    when(answers) {
      return answers.projectType === 'faas';
    },
    validate(val) {
      if (val && val.trim()) return true;
      return 'Input your FaaS region.';
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
