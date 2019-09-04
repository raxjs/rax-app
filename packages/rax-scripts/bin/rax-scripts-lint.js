#!/usr/bin/env node

const program = require('commander');

program
  .action(() => {
    require('../src/lint')();
  });

program.parse(process.argv);
