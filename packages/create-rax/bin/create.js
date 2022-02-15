#!/usr/bin/env node
const https = require('https');
const spawn = require('cross-spawn');

const argv = process.argv.slice(2);

const TAO_BAO_REGISTRY = 'https://registry.npmmirror.com';
const DEFAULT_REGISTRY = 'https://registry.npmjs.org';

function pingUrl(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, (res) => {
        const { statusCode } = res;
        if (statusCode === 200) {
          resolve(url);
        } else {
          reject(new Error(`Http status is ${statusCode}`));
        }
      })
      .on('error', (err) => {
        reject(err);
      });
  });
}

function checkRegistry() {
  return Promise.race([pingUrl(TAO_BAO_REGISTRY), pingUrl(DEFAULT_REGISTRY)]);
}

checkRegistry()
  .then((registry) => {
    console.log('Current registry: ', registry);

    // Install rax-cli manually through fastest registry
    // This way is faster than npm dependence
    spawn.sync('npm', ['install', 'rax-cli@latest', '-g', '--registry', registry], {
      stdio: 'inherit',
    });

    spawn.sync('rax', ['init', ...argv], {
      stdio: 'inherit',
    });
  })
  .catch((err) => {
    console.error(err);
  });
