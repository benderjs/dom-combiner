[![Build Status](https://travis-ci.org/benderjs/dom-combiner.svg?branch=master)](https://travis-ci.org/benderjs/dom-combiner)

dom-combiner
============

[Node.js](http://nodejs.org) utility that builds a single page from two or more sources by merging `document`s and `documentFragment`s created with [parse5](https://github.com/inikulin/parse5) into a single object. Subsequent sources overwrites or extends previous sources.

Default behaviours:

- Overwrite `<!doctype>` declaration
- Overwrite `<title>`'s content
- Overwrite `<meta>` tags' values
- Append new attributes to unique elements
- Overwrite existing attributes of unique
- Append new elements in `<head>` and `<body>` sections to their equivalents
- If the elements are not wrapped in `<html>`/`<head>`/`<body>` append them to the `<body>` element of the previous source
- Treat contents of `<script>`, `<style>`, `<textarea>` elements as a plain text

Installation
------------

```
npm install dom-combiner
```

Usage
-----

```javascript
combine(html_1, html_2, [..., html_n], [callback]);
```

Example
-------

```javascript
var combine = require('dom-combiner'),
    template = '<!doctype html><html><head><title>Foo</title></head><body></body></html>',
    html = '<body class="foo"><div id="baz">Baz</div></body>';

var output = combine(template, html);
// <!doctype html><html><head><title>Foo</title></head><body class="foo"><div id="baz">Baz</div></body></html>
```

Testing
-------

```
npm test
```

License
-------

MIT, for license details see: [LICENSE.md](https://github.com/benderjs/dom-combiner/blob/master/LICENSE.md).
