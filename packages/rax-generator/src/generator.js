const ejs = require('ejs');
const path = require('path');
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

// languageType is js, src/js/xxx  -> src/xxx
function processLanguageType(args) {
  const { languageType } = args;
  return (files) => {
    for (let i = 0; i < files.length; i++) {
      files[i].name = files[i].name.replace(`src${path.sep}${languageType}`, 'src');
    }
  };
}

// get ignore files of template
function getIgnore(args) {
  const { projectType, languageType, projectTargets } = args;
  let list = [];

  if (projectType === 'component') {
    if (projectTargets.indexOf('miniapp') < 0) {
      list = [...list, 'demo/miniapp'];
    }
    if (projectTargets.indexOf('wechat-miniprogram') < 0) {
      list = [...list, 'demo/wechat-miniprogram'];
    }
  } else if (projectType === 'app') {
    if (appType === 'mpa') {
      list = ['src/js/app.js.ejs', 'src/ts/app.ts.ejs'];
    }
  }

  // Process languageType
  if (languageType === 'js') {
    list.push('src/ts');
    list.push('tsconfig.json.ejs');
  } else if (languageType === 'ts') {
    list.push('src/js');
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
    .use(processLanguageType(args))
    .ignore(getIgnore(args))
    .done(projectDir);

  process.chdir(projectDir);
  return Promise.resolve(projectDir);
};
