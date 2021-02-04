# @builder/html-generator

## Install

```bash
$ npm install @builder/html-generator --save-dev
```

## Usage

### Base

```js
import Generator from '@builder/html-generator';

const tmpl = '<html><head><title>Rax App</title></head><body><div class="home" id="root">Weclome Home</div></body></html>';

const $ = new Generator(tmpl);

console.log('HTML is ', $.html());
```

### Config root element

```js
import Generator from '@builder/html-generator';

const tmpl = '<html><head><title>Rax App</title></head><body><div class="home" id="container">Weclome Home</div></body></html>';

const $ = new Generator(tmpl, { rootId: 'container' });
```

### Modify root element content

```js
import Generator from '@builder/html-generator';

const tmpl = '<html><head><title>Rax App</title></head><body><div class="home" id="container">Weclome Home</div></body></html>';

const $ = new Generator(tmpl, { rootId: 'container' });

$.root.innerHTML = 'New content.';
```

### Get root element content

```js
import Generator from '@builder/html-generator';

const tmpl = '<html><head><title>Rax App</title></head><body><div class="home" id="container">Weclome Home</div></body></html>';

const $ = new Generator(tmpl, { rootId: 'container' });

console.log('Root element content is ', $.root.innerHTML);
```

### Modify title content

```js
import Generator from '@builder/html-generator';

const tmpl = '<html><head><title>Rax App</title></head><body><div class="home" id="container">Weclome Home</div></body></html>';

const $ = new Generator(tmpl, { rootId: 'container' });

$.title..innerHTML = 'New title';
```

### Modify body attributes

```js
import Generator from '@builder/html-generator';

const tmpl = '<html><head><title>Rax App</title></head><body><div class="home" id="container">Weclome Home</div></body></html>';

const $ = new Generator(tmpl, { rootId: 'container' });

$.body.attributes += ' data-index="example"';
```

### Insert link

```js
import Generator from '@builder/html-generator';

const tmpl = '<html><head><title>Rax App</title></head><body><div class="home" id="container">Weclome Home</div></body></html>';

const $ = new Generator(tmpl, { rootId: 'container' });

// Arrays are also supported
$.insertLink('<link rel="stylesheet" type="text/css" href="//g.alicdn.com">');
```

### Insert meta

```js
import Generator from '@builder/html-generator';

const tmpl = '<html><head><title>Rax App</title></head><body><div class="home" id="container">Weclome Home</div></body></html>';

const $ = new Generator(tmpl, { rootId: 'container' });

// Arrays are also supported
$.insertMeta('<meta name="viewport" content="width=device-width, initial-scale=1.0">');
```

### Insert script

```js
import Generator from '@builder/html-generator';

const tmpl = '<html><head><title>Rax App</title></head><body><div class="home" id="container">Weclome Home</div></body></html>';

const $ = new Generator(tmpl, { rootId: 'container' });

// Arrays are also supported
$.insertScript('<script src="//g.alicdn.com/index.js"></script>');
```

### Get inserted elements


```js
import Generator from '@builder/html-generator';

const tmpl = '<html><head><title>Rax App</title></head><body><div class="home" id="container">Weclome Home</div></body></html>';

const $ = new Generator(tmpl, { rootId: 'container' });

$.insertScript('<script src="//g.alicdn.com/index.js"></script>');

console.log('Inserted scripts: ', $.insertedScripts);
```
