const postcss = require('postcss');
const fs = require('fs-extra');
const CleanCSS = require('clean-css');
const page2root = require('../css-plugins/replaceRoot');
const removeInvalidDecls = require('../css-plugins/removeInvalidDecls');

module.exports = (filePath, themePath, callback) => {
  const cssContents = fs.readFileSync(filePath, {
    encoding: 'utf8',
  });

  let themeContents = '';

  if (themePath && fs.existsSync(themePath)) {
    themeContents = fs.readFileSync(themePath, 'utf8');
  }

  (async () => {
    const result = await postcss([
      require('postcss-import'),
      // transform 'page {}' selectors into ':root {}' for wechat-miniprogram in order to remove css vars
      page2root(),
      require('postcss-css-variables'),
      removeInvalidDecls(),
    ]).process(`${cssContents} \n ${themeContents}`, {});

    const r = new CleanCSS({
      level: 2,
      inline: ['all'],
    }).minify(result.css);

    fs.writeFileSync(filePath, r.styles);

    callback();
  })();
};
