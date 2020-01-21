const ejs = require('ejs');
const TemplateProcesser = require('./templateProcesser');

// Rename files start with '_'
function renameFile(files) {
  files.forEach(file => {
    file.name = file.name.replace(/^_/, '.').replace(/\.ejs$/, '');
  });
}

// Render ejs template
function ejsRender(data) {
  return (files) => {
    files.forEach(file => {
      if (/\.ejs$/.test(file.name)) {
        try {
          file.content = ejs.render(file.content, data);
        } catch (error) {
          console.error(`\nError occurs when compiling "${file.name}" file.`);
          console.error(error);
        }
      }
    });
  };
}

// get ignore files of template
function getIgnore(args) {
  const { appType, componentType, projectFeatures, projectTargets } = args;
  let list = [];

  if (appType === 'lite') {
    list = ['src/components', 'src/pages', 'src/app.json.ejs'];
  } else if (componentType === 'ui') {
    list = [
      'demo/index.jsx.ejs',
    ];

    if (projectTargets.indexOf('miniapp') < 0) {
      list = [...list, 'demo/miniapp'];
    }
    if (projectTargets.indexOf('wechat-miniprogram') < 0) {
      list = [...list, 'demo/wechat-miniprogram'];
    }
  } else if (componentType === 'base') {
    list = [
      'demo/basic.md.ejs',
      'demo/advance.md.ejs',
      'src/style',
      'CHANGELOG.md.ejs',
      'README.en-US.md.ejs',
      '.commitlintrc.js.ejs',
      '.eslintrc.js.ejs',
      '.eslintignore.ejs',
      '.prettierrc.ejs',
      '.prettierignore.ejs',
    ];
  }
  
  if (!projectFeatures || Array.isArray(projectFeatures) && !projectFeatures.includes('faas')) {
    list.push('src/api');
  }

  return list;
}

/**
 * Template generator.
 * @param  {String} template - describe the template path
 * @param  {Object} args - describe the generator arguements
 * @param  {String} args.root - The absolute path of project directory
 * @param  {String} args.directoryName - The folder name
 * @param  {String} args.projectName - Kebabcased project name
 * @param  {String} args.projectType - Kebabcased project type
 * @param  {String} args.appType - The application type
 * @param  {String} args.projectAuthor - The name of project author
 * @param  {Array} args.projectTargets- The build targets of project
 * @param  {Array} args.projectFeatures- The features of project
 * @return {Promise}
 */
module.exports = function(template, args) {
  const projectDir = args.root;
  const ejsData = {
    ...args,
    npmName: args.projectName, // Be consistent with ice-devtools
  };

  new TemplateProcesser(template)
    .use(ejsRender(ejsData))
    .use(renameFile)
    .ignore(getIgnore(args))
    .done(projectDir);

  process.chdir(projectDir);
  return Promise.resolve(projectDir);
};
