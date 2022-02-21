import {
  addSpmA,
  addSpmB,
  getBuiltInHtmlTpl,
  getInjectedHTML,
  injectHTML,
  insertScriptsByInfo,
  genComboedScript,
} from '../utils/htmlStructure';

describe('generate html structure', () => {
  it('should return SPM A string', () => {
    expect(addSpmA('a1234')).toEqual('<meta name="data-spm" content="a1234" />');
  });

  it('should add SPM B', () => {
    expect(addSpmB('b1234')).toEqual('data-spm="b1234"');
  });

  it('should generate html', () => {
    injectHTML('script', [
      '<script src="https://g.alicdn.com/code/lib/rax/1.1.4/rax.min.js"></script>',
      '<script src="https://g.alicdn.com/code/lib/react/17.0.0/react.min.js"></script>',
    ]);
    injectHTML('meta', [
      '<meta name="apple-mobile-web-app-capable" content="yes">',
      '<meta name="apple-mobile-web" content="yes">',
    ]);
    injectHTML('link', [
      '<link rel="dns-prefetch" href="https://github.githubassets.com">',
      '<link rel="dns-prefetch" href="https://avatars.githubusercontent.com">',
    ]);
    insertScriptsByInfo([
      {
        src: 'https://g.alicdn.com/ali-lib/appear-polyfill/0.1.2/index.js',
      },
    ]);
    const injectedHTML = getInjectedHTML();

    expect(
      getBuiltInHtmlTpl({
        doctype: '<!DOCTYPE html>',
        injectedHTML,
        initialHTML: '',
        assets: {
          scripts: ['/home.js'],
          links: ['/home.css'],
        },
        spmA: 'a1234',
        spmB: 'b1234',
      }, true),
    ).toEqual(`
  <!DOCTYPE html>
  <html>
    <head>
      <meta charset=\"utf-8\" />
      <meta name="data-spm" content="a1234" />
      <meta name=\"viewport\" content=\"width=device-width,initial-scale=1,maximum-scale=1,minimum-scale=1,user-scalable=no,viewport-fit=cover\" />
      <meta name=\"apple-mobile-web-app-capable\" content=\"yes\">
<meta name=\"apple-mobile-web\" content=\"yes\">

      <title></title>
      <link rel=\"dns-prefetch\" href=\"https://github.githubassets.com\">
<link rel=\"dns-prefetch\" href=\"https://avatars.githubusercontent.com\">

      <link rel=\"stylesheet\" href=\"/home.css\" />

    </head>
    <body data-spm="b1234">
      <!--__BEFORE_ROOT__-->
      <div id=\"root\"><!--__INNER_ROOT__--></div>
      <script src=\"https://g.alicdn.com/code/lib/rax/1.1.4/rax.min.js\"></script>
<script src=\"https://g.alicdn.com/code/lib/react/17.0.0/react.min.js\"></script>
<script src=\"https://g.alicdn.com/ali-lib/appear-polyfill/0.1.2/index.js\" ></script>

      <!--__AFTER_ROOT__-->
      <script crossorigin=\"anonymous\" type=\"application/javascript\" src=\"/home.js\"></script>

    </body>
  </html>
`);
  });

  it('should generate comboed script', () => {
    expect(genComboedScript([
      {
        src: 'code/lib/rax/1.1.4/rax.js',
        script: '<script crossorigin="anonymous" src="https://g.alicdn.com/code/lib/rax/1.1.4/rax.js"></script>'
      },
      {
        src: 'mtb/lib/2.8.0/index.js',
        script: '<script crossorigin="anonymous" src="https://g.alicdn.com/mtb/lib/2.8.0/index.js"></script>'
      }
    ])).toEqual('<script class="__combo_script__" crossorigin="anonymous" src="https://g.alicdn.com/??code/lib/rax/1.1.4/rax.js,mtb/lib/2.8.0/index.js"></script>');
  });
});
