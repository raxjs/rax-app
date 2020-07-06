const ejs = require('ejs');
const path = require('path');
const fse = require('fs-extra');
const { checkAliInternal } = require('ice-npm-utils');
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
 * @param  {String} args.projectType - Kebabcased project type: app/component/api/plugin
 * @param  {String} args.appType - The application type: spa/mpa
 * @param  {Array} args.projectTargets- The build targets of project
 * @param  {String} args.npmName- npm package name
 * @param  {Boolean} args.enablePegasus- generate seed
 * @return {Promise}
 */
module.exports = async function(template, args) {
  const { root: projectDir, projectType } = args;
  const isAliInternal = await checkAliInternal();
  const npmName = args.npmName || (isAliInternal ? `@ali/${args.projectName}` : args.projectName);

  const ejsData = {
    ...args,
    npmName,
  };

  new TemplateProcesser(template)
    .use(ejsRender(ejsData))
    .use(renameFile)
    .use(processLanguageType(args))
    .ignore(getIgnore(args))
    .done(projectDir);

  const abcPath = path.join(projectDir, 'abc.json');
  const pkgPath = path.join(projectDir, 'package.json');
  const buildJsonPath = path.join(projectDir, 'build.json');
  const buildData = fse.readJsonSync(buildJsonPath);
  const pkgData = fse.readJsonSync(pkgPath);

  if (isAliInternal) {
    const abcData = {
      type: 'rax',
      builder: '',
      info: {
        raxVersion: '1.x'
      }
    };

    if (projectType === 'app') {
      abcData.builder = '@ali/builder-rax-v1';
      pkgData.devDependencies['@ali/build-plugin-rax-app-def'] = '^1.0.0';
      buildData.plugins.push('@ali/build-plugin-rax-app-def');
    } else {
      abcData.builder = '@ali/builder-component';
      if (args.enablePegasus) {
        pkgData.devDependencies['@ali/build-plugin-rax-seed'] = '^1.0.0';
        buildData.plugins.push('@ali/build-plugin-rax-seed');
      }
      pkgData.publishConfig = {
        registry: 'https://registry.npm.alibaba-inc.com',
      };
    }

    fse.writeJSONSync(abcPath, abcData, { spaces: 2 });
    fse.writeJSONSync(buildJsonPath, buildData, { spaces: 2 });
    fse.writeJSONSync(pkgPath, pkgData, { spaces: 2 });
  }

  process.chdir(projectDir);
  return Promise.resolve(projectDir);
};
