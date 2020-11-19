const trackIdPlugin = require('../index');
const { transform } = require('@babel/core');
const syntaxJSX = require('babel-plugin-syntax-jsx');

function getTransformCode(code, opts) {
  return transform(code, {
    filename: './',
    configFile: false,
    plugins: [
      trackIdPlugin,
      syntaxJSX
    ]
  }).code;
}

describe('generate track-id', () => {
  it('generate track-id for tag with onClick', () => {
    expect(getTransformCode('<div onClick={onClick}>Click</div>'))
      .toBe('<div onClick={onClick} track-id="31d6cfe00">Click</div>;');
  });

  it('generate track-id for tag with href', () => {
    expect(getTransformCode('<a href="/">Link</a>'))
      .toBe('<a href="/" track-id="31d6cfe00">Link</a>;');
  });

  it('should not generate track-id for tag already have track-id', () => {
    expect(getTransformCode('<a href="/" track-id="item">Link</a>'))
      .toBe('<a href="/" track-id="item">Link</a>;');
  });
});
