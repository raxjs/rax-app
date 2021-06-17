const { transformSync } = require('@babel/core');
const atomicComponentPlugin = require('../index');

function getTransfromCode(code) {
  return transformSync(code, {
    filename: './',
    presets: [
      [require.resolve('@babel/preset-env'), {
        loose: true,
        modules: false,
        targets: {
          node: '14'
        }
      }],
    ],
    plugins: [
      [require.resolve( '@babel/plugin-syntax-jsx' )],
      [atomicComponentPlugin, {
        useBuiltIns: true,
      }],
    ],
  }).code;
}

describe('transform atomic components', () => {
  // rax-view
  it('tansform rax-view with className', () => {
    expect(
      getTransfromCode( `
        import View from 'rax-view';
        <View className="test"></View>
      ` )
    ).toMatchSnapshot()
  });

  it('tansform rax-view with className expression', () => {
    expect(
      getTransfromCode( `
        import View from 'rax-view';
        <View className={ expr ? 'a' : b }></View>
      ` )
    ).toMatchSnapshot()
  });

  it('tansform rax-view with children', () => {
    expect(
      getTransfromCode( `
        import View from 'rax-view';
        <View className="klass">
          I am JSXText
          <span className="a">hello</span>
          { expr }
        </View>
      ` )
    ).toMatchSnapshot()
  });

  it('tansform rax-view with style', () => {
    expect(
      getTransfromCode( `
        import View from 'rax-view';
        <View className="klass" style={{ border: a ? b : c, color: '#FFF', backgroundColor: expr + 'string' }}>
        </View>
      ` )
    ).toMatchSnapshot()
  });

  it('tansform rax-view with style and other props', () => {
    expect(
      getTransfromCode( `
        import View from 'rax-view';
        <View data-x="a" className="klass" style={{ border: a ? b : c, color: '#FFF', backgroundColor: expr + 'string' }}>
        </View>
      ` )
    ).toMatchSnapshot()
  });

  it('tansform rax-view with innerHTML', () => {
    expect(
      getTransfromCode( `
        import View from 'rax-view';
        <View className="test" dangerouslySetInnerHTML={{__html: "<div>a</div>"}}>
        </View>
      ` )
    ).toMatchSnapshot()
  });

  // rax-text
  it('tansform rax-text with className', () => {
    expect(
      getTransfromCode( `
        import Text from 'rax-text';
        <Text className="test"></Text>
      ` )
    ).toMatchSnapshot()
  });

  it('tansform rax-text with className expression', () => {
    expect(
      getTransfromCode( `
        import Text from 'rax-text';
        <Text className={ expr ? 'a' : b }></Text>
      ` )
    ).toMatchSnapshot()
  });

  it('tansform rax-text with children', () => {
    expect(
      getTransfromCode( `
        import Text from 'rax-text';
        <Text className="klass">
          I am JSXText
          <span className="a">hello</span>
          { expr }
        </Text>
      ` )
    ).toMatchSnapshot()
  });

  it('tansform rax-text with style', () => {
    expect(
      getTransfromCode( `
        import Text from 'rax-text';
        <Text style={{ border: a ? b : c, color: '#FFF', backgroundColor: expr + 'string' }}>
        </Text>
      ` )
    ).toMatchSnapshot()
  });

  it('tansform rax-text with style and other props', () => {
    expect(
      getTransfromCode( `
        import Text from 'rax-text';
        <Text data-x="a" className="klass" style={{ border: a ? b : c, color: '#FFF', backgroundColor: expr + 'string' }}>
        </Text>
      ` )
    ).toMatchSnapshot()
  });
});
