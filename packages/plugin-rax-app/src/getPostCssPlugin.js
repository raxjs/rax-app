const atImport = require('postcss-import');

module.exports = function getPlugins(type) {
  switch (type) {
    case 'normal':
      return [
        atImport(),
      ];
    // Inline style
    case 'web-inline':
      return [
        atImport(),
        require('postcss-plugin-rpx2vw')(),
      ];

    // extract css file in web while inlineStyle is disabled
    // web standard
    case 'web':
      return [
        atImport(),
        require('@builder/pack/deps/postcss-preset-env')({
          autoprefixer: {
            flexbox: 'no-2009',
          },
          stage: 3,
        }),
        require('postcss-plugin-rpx2vw')(),
      ];
    default:
      return [];
  }
};
