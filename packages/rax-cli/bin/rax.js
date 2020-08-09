#!/usr/bin/env node

const updateNotifier = require('update-notifier');
const fs = require('fs');
const path = require('path');
const inquirer = require('inquirer');
const chalk = require('chalk');
const semver = require('semver');
const kebabCase = require('lodash.kebabcase');
const { checkAliInternal } = require('ice-npm-utils');
const argv = require('minimist')(process.argv.slice(2));
const { downloadAndGenerateProject } = require('@iceworks/generate-project');
const { generateComponent } = require('@iceworks/generate-material');

const config = require('./config');
const pkg = require('../package.json');

let projectName = '';

// notify package update
updateNotifier({ pkg }).notify();

// Check node version
if (!semver.satisfies(process.version, '>=8')) {
  const message = `You are currently running Node.js ${
    chalk.red(process.version)}.\n` +
    '\n' +
    'Rax runs on Node 6.0 or newer. There are several ways to ' +
    'upgrade Node.js depending on your preference.\n' +
    '\n' +
    'nvm:       nvm install node && nvm alias default node\n' +
    'Homebrew:  brew install node\n' +
    'Installer: download the Mac .pkg from https://nodejs.org/\n';

  console.log(message);
  process.exit(1);
}


/**
 * check version
 * usage: rax -v or rax --version
 */
if (argv._.length === 0 && (argv.v || argv.version)) {
  console.log(`rax-cli: ${pkg.version}`);
  try {
    const RAX_PACKAGE_JSON_PATH = path.resolve(
      process.cwd(),
      'node_modules',
      'rax',
      'package.json',
    );
    console.log(`rax: ${require(RAX_PACKAGE_JSON_PATH).version}`);
  } catch (e) {
    console.log('rax: n/a - not inside a Rax project directory');
  }
  process.exit();
}

function printHelp() {
  console.log(`Usage: rax <command> [options]
Options:
  -v, --version                              output the version number
  -h, --help                                 output usage information

Commands:
  init <app-name>                            generate project directory based on templates

Run rax <command> --help for detailed usage of given command.
`);
}

function printInitHelp() {
  console.log(`Usage: rax init [options] <app-name>

Options:
  -v, --verbose                               show project init details
`);
}

if (argv._.length === 0 && (argv.h || argv.help)) {
  printHelp();
  process.exit();
}

// check commands
const commands = argv._;
let createInCurrent = true;

if (commands.length === 0) {
  printHelp();
  process.exit(1);
}
switch (commands[0]) {
  case 'init':
    if (argv.h || argv.help) {
      printInitHelp();
      process.exit();
    }

    init(commands[1], argv.v || argv.verbose, argv.t || argv.template);
    break;
  default:
    console.error(
      chalk.red(`Command \`${commands[0]}\` unrecognized.`),
    );
    printHelp();
    process.exit(1);
    break;
}

/**
 * rax init
 */
async function init(name, verbose, template) {
  projectName = name;
  createInCurrent = !projectName;
  if (!projectName) {
    projectName = process.cwd().split(path.sep).pop();
  }

  const answers = await askProjectInformaction();

  await createProject(kebabCase(projectName), verbose, template, answers);
}

function askProjectInformaction() {
  const rootDir = path.resolve(projectName);
  const conflictFiles = ['src', 'build.json', 'package.json'];

  /**
   * Check whether contains conflict files
   * @param  {String} targetDir
   * @return {Boolean}
   */
  const containConflictFile = (targetDir) => {
    return conflictFiles.some(filename => fs.existsSync(path.join(targetDir, filename)));
  };

  let prompts = config.promptQuestion;
  if (containConflictFile(rootDir)) {
    prompts = [
      {
        type: 'confirm',
        name: 'shouldInputNewProjectName',
        message: `The directory ${projectName} contains files that could conflict:\n\n${conflictFiles.join('\n')}\n\nEither try using a new directory name, or still use the directory ${projectName}.`,
        default: true
      },
      {
        type: 'input',
        name: 'projectName',
        message: 'Please input a new directory name.',
        when(answers) {
          return answers.shouldInputNewProjectName;
        },
        validate: (newName) => {
          const newRootDir = path.resolve(newName);
          if (newName === projectName) {
            return 'Same as the original name, please change another name.';
          } else if (containConflictFile(newRootDir)) {
            return 'This directory also contains files that could conflict, please change another name.';
          } else if (!newName) {
            return 'Please enter a name that cannot be empty.';
          }
          projectName = newName;
          return true;
        }
      }
    ].concat(prompts);
  }

  return inquirer.prompt(prompts);
}

async function createProject(name, verbose, template, userAnswers) {
  const projectName = name;

  let rootDir = process.cwd();
  if (!createInCurrent) {
    rootDir = path.resolve(name);
    if (!fs.existsSync(rootDir)) {
      fs.mkdirSync(rootDir);
    }
    process.chdir(rootDir);
  }

  console.log(
    'Creating a new Rax project in',
    rootDir,
  );

  const { projectType, projectTargets, appType, languageType } = userAnswers;
  if (projectType === 'app') {
    await downloadAndGenerateProject(
      rootDir,
      languageType === 'ts' ? '@rax-materials/scaffolds-app-ts' : '@rax-materials/scaffolds-app-js',
      null,
      null,
      null,
      {
        targets: projectTargets,
        mpa: appType === 'mpa'
      }
    );
  } else {
    const typeToTemplate = {
      component: '@icedesign/template-rax',
      api: '@icedesign/template-rax-api',
      plugin: '@icedesign/template-rax-miniapp-plugin'
    };

    await generateComponent({
      rootDir,
      registry: 'https://registry.npm.alibaba-inc.com',
      template: typeToTemplate[projectType],
      templateOptions: {
        npmName: 'rax-example',
      }
    });
  }

  console.log(chalk.white.bold('To run your app:'));
  if (!createInCurrent) {
    console.log(chalk.white(`   cd ${projectName}`));
  }

  const isAliInternal = await checkAliInternal();
  let npmCommand = 'npm';
  let explanation = '';
  if (isAliInternal) {
    npmCommand = 'tnpm';
    explanation = 'Detected that you are an Alibaba user, DEF plugin has been installed!\n\n';
  }

  console.log(chalk.white(`   ${npmCommand} install`));
  console.log(chalk.white(`   ${npmCommand} start`));
  console.log(chalk.white(`${explanation}We have prepared develop toolkit for you. \nSee: https://marketplace.visualstudio.com/items?itemName=iceworks-team.iceworks`));
}
