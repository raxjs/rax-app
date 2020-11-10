const { relative } = require('path');
const crypto = require('crypto');
const t = require('@babel/types');

/**
 * @param {string} name a filename to hash
 * @returns {string} hashed filename
 */
const hashFilename = name => {
  const result = crypto
    .createHash('md4')
    .update(name)
    .digest('hex');

  return result.slice(0, 8);
};

module.exports = function() {
  return {
    pre(state) {
      this.cache = {};
    },
    visitor: {
      JSXOpeningElement(path, { file, opts }) {
        const { container } = path;

        let hasEvent = false;
        let hasTrackId = false;

        const attributes = container.openingElement.attributes;

        for (let i = 0; i < attributes.length; i++) {
          const name = attributes[i].name;
          if (name) {
            if (!hasEvent) {
              if (name.name === 'onClick') {
                hasEvent = true;
              }

              if (name.name === 'href') {
                hasEvent = true;
              }
            }

            if (!hasTrackId) {
              hasTrackId = name.name === 'track-id';
            }
          }
        }

        if (hasEvent && !hasTrackId) {
          const filePath = file.opts.filename;
          const rootPath = file.opts.root;

          let trackId;

          if (this.cache[filePath]) {
            const fileInfo = this.cache[filePath];
        
            fileInfo.uid ++;
        
            trackId = `${fileInfo.hash}${fileInfo.uid.toString(16)}`;
          } else {
            const fileName = relative(rootPath, filePath);
            const fileHash = hashFilename(fileName);
          
            this.cache[filePath] = {
              hash: fileHash,
              uid: 0
            };
          
            trackId = `${fileHash}0`;
          }

          attributes.push(t.jSXAttribute(t.jSXIdentifier('track-id'), t.StringLiteral(trackId)));
        }
      }
    }
  };
};
