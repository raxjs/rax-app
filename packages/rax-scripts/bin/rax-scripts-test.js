#!/usr/bin/env node

const program = require('commander');

program
  .action(() => {
    require('../src/jest')();
  });

program.parse(process.argv);
