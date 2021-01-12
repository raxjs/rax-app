function getPromptQuestion(appTemplate) {
  const promptQuestion = [{
    type: 'list',
    name: 'projectType',
    message: 'What\'s your project type?',
    default: 'app',
    when(answers) {
      if (appTemplate) {
        answers.projectType = 'app';
        return false;
      }
      return true;
    },
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
      {
        name: 'Plugin (Build plugin for miniapp)',
        value: 'plugin',
      },
    ],
  }, {
    type: 'checkbox',
    name: 'targets',
    default: ['web'],
    validate(targets) {
      if (targets && targets.length > 0) return true;
      return 'Choose at least one of target.';
    },
    when(answers) {
      // app 不选 targets 直接走下面的 appType 即可
      return answers.projectType !== 'app';
    },
    message: 'Choose targets your project want to run?',
    choices(answers) {
      let targets =
      [
        {
          name: 'Alibaba MiniApp',
          value: 'miniapp',
        },
        {
          name: 'WeChat MiniProgram',
          value: 'wechat-miniprogram',
        },
      ];
      if (answers.projectType !== 'plugin') {
        targets = [{
          name: 'Web',
          value: 'web',
        }].concat(targets).concat([{
          name: 'Kraken (Flutter)',
          value: 'kraken',
        }]);
      }
      return targets;
    },
  }, {
    type: 'list',
    name: 'appType',
    message: 'What\'s your application type? ',
    when(answers) {
      return answers.projectType === 'app';
    },
    choices: [
      {
        name: 'Web 多页应用',
        value: 'web-mpa',
      },
      {
        name: '小程序跨端应用',
        value: 'miniapp',
      },
      {
        name: 'Kraken 跨端应用',
        value: 'kraken-mpa',
      },
      {
        name: 'Weex 跨端应用',
        value: 'weex-mpa',
      },
      {
        name: 'Web 单页应用',
        value: 'web-spa',
      },
    ],
    default: 'web-mpa',
  }, {
    type: 'list',
    name: 'languageType',
    message: 'What type of language do you want to use?',
    when(answers) {
      return (answers.projectType === 'app' || answers.projectType === 'component') && !appTemplate;
    },
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
    default: 'ts',
  }];

  return promptQuestion;
}

module.exports = {
  getPromptQuestion,
};
