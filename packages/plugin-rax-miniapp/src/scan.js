const { scan } = require('@ali/iceworks-idp-reporter');

module.exports = function () {
  scan({
    source: 'rax-app',
    target: process.cwd(),
  });
};
