const extRegex = /\.(css|js|wxss|acss)(\?|$)/;

module.exports = function(filePath) {
  const extMatch = extRegex.exec(filePath);
  return extMatch && ['wxss', 'acss', 'css'].includes(extMatch[1]);
};
