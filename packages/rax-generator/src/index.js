const path = require('path');
const generate = require('./generator');
const config = require('./config');

module.exports = {
  /**
   * export global config
   */
  config,

  /**
   * The entry of init.
   * @param  {Object} args - describe the init arguements
   * @param  {String} args.root - The absolute path of project directory
   * @param  {String} args.projectName - Kebabcased project name
   * @param  {String} args.projectType - Kebabcased project type
   * @param  {String} args.projectAuthor - The name of project author
   * @param  {Array} args.projectTargets- The build targets of project
   * @return {Promise}
   */
  init(args) {
    const defaultInfo = {
      root: process.cwd(),
      projectName: '',
      projectType: 'app',
      appType: 'spa',
      languageType: 'js',
    };

    const projectInfo = Object.assign({}, defaultInfo, args);
    const template = projectInfo.template;
    let templatePath;
    // Use a local template
    if (template && /^(\/|\.)/.test(template)) {
      // current work dir is projectInfo.root
      templatePath = path.resolve(template, projectInfo.projectType);
    } else {
      templatePath = path.resolve(__dirname, 'template', projectInfo.projectType);
    }

    return generate(templatePath, projectInfo).then(res => {
      return res;
    });
  },
};
