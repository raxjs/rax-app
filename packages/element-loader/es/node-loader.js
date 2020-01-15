import path from 'path';
import parser from './parserHTML';
import loaderUtils from 'loader-utils';

module.exports = function (content) {
  this.cacheable();
  var query = loaderUtils.parseQuery(this.query);
  var type = query.type;
  var filename = path.basename(this.resourcePath);
  var parts = parser(content);
  var part = parts[type];
  var output = '';
  var source;

  if (Array.isArray(part)) {
    part = part[query.index];
  }

  if (type !== 'script') {
    output = part.content;
    source = parts;
  } else {
    output = query.banner + "\n" + (part.content || defaultComponent);
  }

  this.callback(null, output, source);
};

var defaultComponent = "\n  export default class extends Component {\n    constructor(props) {\n      super(props);\n    }\n  }\n";