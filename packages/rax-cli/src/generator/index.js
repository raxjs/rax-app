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
        file.content = ejs.render(file.content, data);
      }
    });
  };
}

// get ignore files of template
function getIgnore(scaffoldType, features) {
  let list = [];
  if (scaffoldType === 'lite') {
    list = list.concat(['src/components', 'src/pages', 'src/app.json.ejs']);
  }

  if (!features.includes('serverless')) {
    list = list.concat(['src/api']);
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
 * @param  {String} args.scaffoldType - The application type
 * @param  {String} args.projectAuthor - The name of project author
 * @param  {String} args.projectTargets- The build targets of project
 * @param  {String} args.projectFeatures- The features of project
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
    .ignore(getIgnore(args.scaffoldType, args.projectFeatures))
    .done(projectDir);

  process.chdir(projectDir);
  return Promise.resolve(projectDir);
};
