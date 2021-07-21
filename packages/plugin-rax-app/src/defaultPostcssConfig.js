/* eslint-disable no-case-declarations */
/* eslint-disable global-require */
const atImport = require('postcss-import');

// See https://github.com/postcss/postcss-loader#context-ctx
module.exports = ({ options }) => {
  const type = options && options.type;
  return {
    plugins: getPlugins(type),
  };
};

function getPlugins(type) {
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
        require('postcss-preset-env')({
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
}
