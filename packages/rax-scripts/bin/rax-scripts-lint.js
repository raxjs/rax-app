#!/usr/bin/env node
'use strict';
const program = require('commander');

program
  .action((cmd) => {
    require('../src/lint')();
  });

program.parse(process.argv);
