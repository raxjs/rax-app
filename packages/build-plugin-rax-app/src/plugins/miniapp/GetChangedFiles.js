module.exports = class GetChangedFilesPlugin {
  constructor(changedFiles) {
    this.changedFiles = changedFiles;
  }
  apply(compiler) {
    compiler.hooks.watchRun.tapAsync('GetChangedFiles', async (compiler, callback) => {
      const { watchFileSystem } = compiler;
      const watcher = watchFileSystem.watcher || watchFileSystem.wfs.watcher;
      this.changedFiles.splice(0, this.changedFiles.length, ...Object.keys(watcher.mtimes));
      callback();
    })
  }
};
