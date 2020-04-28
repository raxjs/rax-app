// Add file to compilation
module.exports = function(compilation, filename, content, target) {
  compilation.assets[`${target}/${filename}`] = {
    source: () => content,
    size: () => Buffer.from(content).length
  };
};
