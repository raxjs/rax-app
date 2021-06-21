import Generator from '../Generator';

describe('HTML Generator', () => {
  it('should hold original html', () => {
    const tmpl = '<html><head><title>Rax App</title></head><body><!--__BEFORE_ROOT__--><div class="bbb" id="root" >456</div><!--__AFTER_ROOT__--></body></html>';
    const $ = new Generator(tmpl);
    expect($.html()).toEqual('<html><head><title>Rax App</title></head><body><div class="bbb" id="root" >456</div></body></html>');
  });

  it('should change title', () => {
    const tmpl = '<html><head><title>Rax App</title></head><body><!--__BEFORE_ROOT__--><div class="bbb" id="root" >456</div><!--__AFTER_ROOT__--></body></html>';
    const $ = new Generator(tmpl);
    $.title.innerHTML = 'Home Page';
    const expected =
      '<html><head><title>Home Page</title></head><body><div class="bbb" id="root" >456</div></body></html>';
    expect($.html()).toEqual(expected);
  });

  it('should change root content', () => {
    const tmpl = '<html><head><title>Rax App</title></head><body><!--__BEFORE_ROOT__--><div class="bbb" id="root" ><!--__INNER_ROOT__--></div><!--__AFTER_ROOT__--></body></html>';
    const $ = new Generator(tmpl);
    $.root.innerHTML = 'Welcome Home';
    const expected =
      '<html><head><title>Rax App</title></head><body><div class="bbb" id="root" >Welcome Home</div></body></html>';
    expect($.html()).toEqual(expected);
  });

  it('should insert meta', () => {
    const tmpl = '<html><head><title>Rax App</title></head><body><!--__BEFORE_ROOT__--><div class="bbb" id="root" >456</div><!--__AFTER_ROOT__--></body></html>';
    const $ = new Generator(tmpl);
    $.insertMeta('<meta name="viewport" content="width=device-width, initial-scale=1.0">');
    const expected =
      '<html><head><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Rax App</title></head><body><div class="bbb" id="root" >456</div></body></html>';
    expect($.html()).toEqual(expected);
  });

  it('should insert link', () => {
    const tmpl = '<html><head><title>Rax App</title></head><body><!--__BEFORE_ROOT__--><div class="bbb" id="root" >456</div><!--__AFTER_ROOT__--></body></html>';
    const $ = new Generator(tmpl);
    $.insertLink('<link rel="stylesheet" type="text/css" href="//g.alicdn.com">');
    const expected =
      '<html><head><title>Rax App</title><link rel="stylesheet" type="text/css" href="//g.alicdn.com"></head><body><div class="bbb" id="root" >456</div></body></html>';
    expect($.html()).toEqual(expected);
  });

  it('should insert script', () => {
    const tmpl = '<html><head><title>Rax App</title></head><body><!--__BEFORE_ROOT__--><div class="bbb" id="root" >456</div><!--__AFTER_ROOT__--></body></html>';
    const $ = new Generator(tmpl);
    $.insertScript('<script src="//g.alicdn.com/index.js"></script>');
    const expected =
      '<html><head><title>Rax App</title></head><body><div class="bbb" id="root" >456</div><script src="//g.alicdn.com/index.js"></script></body></html>';
    expect($.html()).toEqual(expected);
  });

  it('should change body attributes', () => {
    const tmpl = '<html><head><title>Rax App</title></head><body><!--__BEFORE_ROOT__--><div class="bbb" id="root" >456</div><!--__AFTER_ROOT__--></body></html>';
    const $ = new Generator(tmpl);
    $.body.attributes += 'data-index="123"';
    const expected =
      '<html><head><title>Rax App</title></head><body data-index="123"><div class="bbb" id="root" >456</div></body></html>';
    expect($.html()).toEqual(expected);
  });

  it('should run without title', () => {
    const tmpl = '<body><!--__BEFORE_ROOT__--><div class="bbb" id="root" >456</div><!--__AFTER_ROOT__--></body>';
    const $ = new Generator(tmpl);
    expect($.html()).toEqual('<body><div class="bbb" id="root" >456</div></body>');
  });

  it('should run without body', () => {
    const tmpl = '<!--__BEFORE_ROOT__--><div class="bbb" id="root" >456</div><!--__AFTER_ROOT__--><script src="//g.alicdn.com/index.js"></script>';
    const $ = new Generator(tmpl);
    expect($.html()).toEqual('<div class="bbb" id="root" >456</div><script src="//g.alicdn.com/index.js"></script>');
  });
});
