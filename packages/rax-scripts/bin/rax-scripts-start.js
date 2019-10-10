#!/usr/bin/env node



const program = require('commander');
const { dev } = require('scripts-core');

program
  .option('--config <config>', 'use custom config')
  .option('--port <port>', 'use custom port')
  .action((cmd) => {
    dev({
      args: {
        config: cmd.config,
        port: cmd.port,
      },
    });
  })
  .parse(process.argv);
