#!/usr/bin/env node



const program = require('commander');
const { build } = require('scripts-core');

program
  .option('--config <config>', 'use custom config')
  .action((cmd) => {
    build({
      args: {
        config: cmd.config,
      },
    });
  })
  .parse(process.argv);
