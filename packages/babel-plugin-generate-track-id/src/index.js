const path = require('path');
const crypto = require('crypto');
const t = require('@babel/types');

/**
 * @param {string} name a filename to hash
 * @returns {string} hashed filename
 */
const hashFilename = name => {
	const result = crypto
		.createHash("md4")
		.update(name)
    .digest("hex");
    
  return result.slice(0, 8);
};

const trackIdCache = {};

/**
 * generate trackId by filePath
 * @param {*} filePath absolute file path
 * @param {*} rootPath 
 */
function getTrackId(filePath, rootPath) {
  if (trackIdCache[filePath]) {
    const fileInfo = trackIdCache[filePath];

    fileInfo.uid ++;

    return `${fileInfo.hash}${fileInfo.uid.toString(16)}`;
  }

  const fileName = path.relative(rootPath, filePath);
  const fileHash = hashFilename(fileName);

  trackIdCache[filePath] = {
    hash: fileHash,
    uid: 0
  };

  return `${fileHash}0`;
}

module.exports = function() {
  return {
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
          const trackId = getTrackId(file.opts.filename, file.opts.root);

          attributes.push(t.jSXAttribute(t.jSXIdentifier('track-id'), t.StringLiteral(trackId)));
        }
      }
    }
  };
};
