const postcss = require('postcss');
const fs = require('fs-extra');
const CleanCSS = require('clean-css');
const page2root = require('../css-plugins/replace-root');
const removeInvalidDecls = require('../css-plugins/remove-invalid-decls');

module.exports = (filePath, callback) => {
  const contents = fs.readFileSync(filePath, {
    encoding: 'utf8',
  });

  (async () => {
    const result = await postcss([
      require('postcss-import'),
      // transform 'page {}' selectors into ':root {}' for wechat-miniprogram in order to remove css vars
      page2root,
      require('postcss-css-variables'),
      removeInvalidDecls,
    ]).process(contents, {});

    const r = new CleanCSS({
      level: 2,
      inline: ['all'],
    }).minify(result.css);

    fs.writeFileSync(filePath, r.styles);

    callback();
  })();
};
