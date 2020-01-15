/*
  MIT License http://www.opensource.org/licenses/mit-license.php
  Author Tobias Koppers @sokra
*/



const ModuleDependency = require('./ModuleDependency');

class PrefetchDependency extends ModuleDependency {
  constructor(request) {
    super(request);
  }

  get type() {
    return 'prefetch';
  }
}

module.exports = PrefetchDependency;
