function splitOnFirst(str = '', separator = '') {
  const separatorIndex = str.indexOf(separator);
  if (separatorIndex === -1) {
    return [];
  }
  return [ str.slice(0, separatorIndex), str.slice(separatorIndex + separator.length) ];
}

function parse(request = '') {
  const lastExclamationMark = request.lastIndexOf('!');
  if (lastExclamationMark) {
    const ret = {};
    const originalRequest = request.substr(lastExclamationMark + 1);
    const [, queryString] = splitOnFirst(originalRequest, '?');
    if (queryString) {
      for (const param of queryString.split('&')) {
        const [key, value] = splitOnFirst(param, '=');
        ret[key] = value;
      }
    }
    return ret;
  }
  return {};
}

module.exports = parse;
