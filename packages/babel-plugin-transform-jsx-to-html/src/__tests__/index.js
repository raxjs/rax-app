const { transformSync } = require('@babel/core');
const jsxToHtmlPlugin = require('../index');

function getTransfromCode(code) {
  return transformSync(code, {
    filename: './',
    presets: [
      [require.resolve('@babel/preset-env'), {
        loose: true,
        modules: false,
      }],
      require.resolve('@babel/preset-react'),
    ],
    plugins: [
      [jsxToHtmlPlugin, {
        useBuiltIns: true,
      }],
      [require.resolve('@babel/plugin-transform-react-jsx'), {
        pragma: 'createElement',
      }],
      [require.resolve('@babel/plugin-transform-modules-commonjs'), {
        strictMode: false,
      }],
    ],
  }).code;
}

describe('transform jsx to html', () => {
  it('tansform with pure html tags', () => {
    expect(getTransfromCode(`
<div>
  <div>a</div>
  <div>b</div>
</div>
    `)).toBe(`[{
  __html: "<div><div>a</div><div>b</div></div>"
}];`);
  });

  it('tansform with component', () => {
    expect(getTransfromCode(`
<div>
  <View />
</div>
    `)).toBe(`[{
  __html: "<div>"
}, createElement(View, {
  key: "__key_0"
}), {
  __html: "</div>"
}];`);
  });

  it('tansform with component already have key', () => {
    expect(getTransfromCode(`
<div>
  <View key="view_1" />
</div>
    `)).toBe(`var _createElement;

[{
  __html: "<div>"
}, createElement(View, (_createElement = {
  key: "__key_0"
}, _createElement["key"] = "view_1", _createElement)), {
  __html: "</div>"
}];`);
  });

  it('tansform component with children', () => {
    expect(getTransfromCode(`
<View>
  <div>a</div>
  <div>b</div>
</View>
    `)).toBe(`createElement(View, {
  key: "__key_0"
}, [{
  __html: "<div>a</div>",
  __isEndWithTextNode: false
}], [{
  __html: "<div>b</div>",
  __isEndWithTextNode: false
}]);`);
  });

  it('tansform with props', () => {
    expect(getTransfromCode(`
<div className="container" style={style} onClick={onClick}>
  <div>a {props.index}</div>
  <div>b {props.index}</div>
</div>
    `)).toBe(`[{
  __html: "<div class=\\"container\\""
}, {
  __attrs: {
    style: style,
    onClick: onClick
  }
}, {
  __html: "><div>a "
}, props.index, {
  __html: "</div><div>b "
}, props.index, {
  __html: "</div></div>"
}];`);
  });

  it('transform wisth jsx spread attribute', () => {
    expect(getTransfromCode(`
<div className={className} {...props}>
  <div>a</div>
</div>
    `)).toBe(`[{
  __html: "<div"
}, {
  __attrs: Object.assign({
    className: className
  }, props)
}, {
  __html: "><div>a</div></div>"
}];`);
  });

  it('tansform with slot', () => {
    expect(getTransfromCode(`
const slot = <div>slot</div>;

<div className="container">
  {slot}
</div>
`)).toBe(`var slot = [{
  __html: "<div>slot</div>",
  __isEndWithTextNode: false
}];
[{
  __html: "<div class=\\"container\\">"
}, slot, {
  __html: "</div>"
}];`);
  });

  it('tansform with es5 component', () => {
    expect(getTransfromCode(`
const slot = createElement('div', null, 'slot');
<div className="container">
  {slot}
</div>
    `)).toBe(`var slot = createElement('div', null, 'slot');
[{
  __html: "<div class=\\"container\\">"
}, slot, {
  __html: "</div>"
}];`);
  });

  it('tansform with innnerHtml', () => {
    expect(getTransfromCode(`
<div dangerouslySetInnerHTML={{__html: "<div>a</div>"}} />
    `)).toBe(`[{
  __html: "<div><div>a</div></div>"
}];`);
  });

  it('tansform with children and innnerHtml', () => {
    expect(getTransfromCode(`
<div dangerouslySetInnerHTML={{__html: a}}>
  123
</div>
    `)).toBe(`[{
  __html: "<div>"
}, {
  __html: a
}, {
  __html: "</div>"
}];`);
  });

  it('mark html when start with text node  ', () => {
    expect(getTransfromCode(`
<div className="container">{props.name}, hello!</div>
`)).toBe(`[{
  __html: "<div class=\\"container\\">"
}, props.name, {
  __html: ", hello!</div>",
  __isStartWithTextNode: true,
  __isEndWithTextNode: false
}];`);
  });

  it('mark html when end with text node  ', () => {
    expect(getTransfromCode(`
<div className="container">hello{props.name}</div>
`)).toBe(`[{
  __html: "<div class=\\"container\\">hello",
  __isEndWithTextNode: true
}, props.name, {
  __html: "</div>"
}];`);
  });
});
