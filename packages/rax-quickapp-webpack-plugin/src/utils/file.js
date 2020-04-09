const {
  removeSync,
  ensureDirSync,
  createWriteStream
} = require('fs-extra');
const yauzl = require('yauzl');
const path = require('path');
const { Transform } = require('stream');

const unzip = (zipPath) => {
  return new Promise((resolve, reject) => {
    yauzl.open(zipPath, { lazyEntries: true }, (err, zipfile) => {
      if (err) throw err;
      zipfile.on('close', () => {
        removeSync(zipPath);
        resolve();
      });
      zipfile.readEntry();
      zipfile.on('error', (err) => {
        reject(err);
      });
      zipfile.on('entry', entry => {
        if (/\/$/.test(entry.fileName)) {
          const fileNameArr = entry.fileName.replace(/\\/g, '/').split('/');
          fileNameArr.shift();
          const fileName = fileNameArr.join('/');
          ensureDirSync(path.join(path.dirname(zipPath), fileName));
          zipfile.readEntry();
        } else {
          zipfile.openReadStream(entry, (err, readStream) => {
            if (err) throw err;
            const filter = new Transform();
            filter._transform = (chunk, encoding, cb) => {
              cb(undefined, chunk);
            };
            filter._flush = (cb) => {
              cb();
              zipfile.readEntry();
            };
            const fileNameArr = entry.fileName.replace(/\\/g, '/').split('/');
            fileNameArr.shift();
            const fileName = fileNameArr.join('/');
            const writeStream = createWriteStream(path.join(path.dirname(zipPath), fileName));
            writeStream.on('close', () => {});
            readStream
              .pipe(filter)
              .pipe(writeStream);
          });
        }
      });
    });
  });
};

module.exports = {
  unzip,
};
