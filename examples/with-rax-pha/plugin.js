module.exports = ({ applyMethod }) => {
  // For test cases
  applyMethod('rax.injectHTML', 'meta', [`<meta name="release-info" content="version=12,app-id=123" />`]);

  applyMethod('rax.insertScriptsByInfo', [
    {
      src: 'https://g.alicdn.com/mtb/lib-promise/3.1.3/polyfillB.js',
      crossorigin: 'anonymous',
    },
  ]);
};
