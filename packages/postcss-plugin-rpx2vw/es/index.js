var postcss = require('postcss'); // !singlequotes|!doublequotes|!url()|pixelunit


var rpxRegex = /"[^"]+"|'[^']+'|url\([^\)]+\)|(\d*\.?\d+)rpx/g;
var defaults = {
  viewportWidth: 750,
  viewportUnit: 'vw',
  fontViewportUnit: 'vw',
  unitPrecision: 5
};
module.exports = postcss.plugin('postcss-rpx2vw', function (options) {
  var opts = Object.assign({}, defaults, options);
  return function (root) {
    root.walkDecls(function (decl, i) {
      // This should be the fastest test and will remove most declarations
      if (decl.value.indexOf('rpx') === -1) return;
      var unit = getUnit(decl.prop, opts);
      decl.value = decl.value.replace(rpxRegex, createRpxReplace(opts, unit, opts.viewportWidth));
    });
    root.walkAtRules('media', function (rule) {
      if (rule.params.indexOf('rpx') === -1) return;
      rule.params = rule.params.replace(rpxRegex, createRpxReplace(opts, opts.viewportUnit, opts.viewportWidth));
    });
  };
});

function toFixed(number, precision) {
  var multiplier = Math.pow(10, precision + 1);
  var wholeNumber = Math.floor(number * multiplier);
  return Math.round(wholeNumber / 10) * 10 / multiplier;
} // transform rpx to vw


function createRpxReplace(opts, viewportUnit, viewportSize) {
  return function (m, $1) {
    if (!$1) return m;
    var pixels = parseFloat($1);
    var parsedVal = toFixed(pixels / viewportSize * 100, opts.unitPrecision);
    return parsedVal === 0 ? '0' : parsedVal + viewportUnit;
  };
} // get unit, font can also use vmin.


function getUnit(prop, opts) {
  return prop.indexOf('font') === -1 ? opts.viewportUnit : opts.fontViewportUnit;
}