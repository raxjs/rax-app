const MemFs = require('memory-fs');

module.exports = class ModifyOutputFileSystemPlugin {
  apply(compiler) {
    compiler.outputFileSystem = new MemFs();
  }
}
