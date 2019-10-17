#!/usr/bin/env node



const program = require('commander');
const { dev, build } = require('scripts-core');
const packageInfo = require('../package.json');

program
  .version(packageInfo.version)

program
  .command('start')
  .description('Start a web server in development mode (hot-reload and inline-module-source-map is enable default)')
  .option('--config <config>', 'use custom config')
  .action((options) => {
    dev({
      args: {
        config: options.config,
      },
    });
  });

program
  .command('build')
  .description('Build project in production mode')
  .option('--config <config>', 'use custom config')
  .action((options) => {
    build({
      args: {
        config: options.config,
      },
    });
  });

program
  .command('lint')
  .description('Lint for source  (only support component now)')
  .action(() => {
    require('../src/lint')();
  });

program
  .command('test')
  .description('Testing use jest(only support component now)')
  .action(() => {
    require('../src/jest')();
  });
 
program.parse(process.argv);