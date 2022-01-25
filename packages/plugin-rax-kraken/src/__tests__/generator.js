const { getInjectContent, getInjectJS, getInjectStyle } = require('../generator');

describe('build-plugin-rax-kraken generator', () => {
  it('should work with getInjectJS', () => {
    expect(getInjectJS('https://g.alicdn.com/foo.js'))
      .toEqual('!function(){var s=document.createElement(\"script\");s.src=\"https://g.alicdn.com/foo.js\";document.head.appendChild(s);}();');
  });

  it('should work with getInjectStyle', () => {
    expect(getInjectStyle('https://g.alicdn.com/foo.css'))
      .toEqual('!function(){var s=document.createElement(\"style\");s.appendChild(document.createTextNode(\"https://g.alicdn.com/foo.css\"));document.head.appendChild(s);}();');
  });

  it('should work with getInjectContent #001', () => {
    expect(getInjectContent('<script src="https://path/to/url"></script>'))
      .toEqual('!function(){var i0=document.createElement(\"script\");i0.setAttribute(\"src\",\"https://path/to/url\");document.body.appendChild(i0);}();');
  });

  it('should work with getInjectContent #001', () => {
    expect(getInjectContent('<script>window.foo = \'bar\'</script>'))
    .toEqual("!function(){var i0=document.createElement(\"script\");document.body.appendChild(i0);i0.appendChild(document.createTextNode(\"window.foo = 'bar'\"));}();");
  });
  
  it('should work with getInjectContent #001', () => {
    expect(getInjectContent('<script>window.foo = 123; \n alert("456");</script>'))
      .toEqual("!function(){var i0=document.createElement(\"script\");document.body.appendChild(i0);i0.appendChild(document.createTextNode(\"window.foo = 123; \\n alert(\\\"456\\\");\"));}();");
  });
  
  it('should work with getInjectContent #001', () => {
    expect(getInjectContent('<div><p><style>.foo {}</style></p>Nested</div>'))
      .toEqual("!function(){var i0=document.createElement(\"div\");document.body.appendChild(i0);var i1=document.createElement(\"p\");i0.appendChild(i1);var i2=document.createElement(\"style\");i1.appendChild(i2);i2.appendChild(document.createTextNode(\".foo {}\"));i0.appendChild(document.createTextNode(\"Nested\"));}();");
  });
});