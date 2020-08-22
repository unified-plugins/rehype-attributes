# rehype-attributes

rehype plugin to modify element attributes.

## Installation

```bash
npm install rehype-attributes
yarn rehype-attributes
```

## Usage

`example.md` looks as follows:

```html
<p><a href="build/PnP.md">test</a></p>
<p><a href="./build/PnP.md">test</a></p>
<p><a href="PnP.md">test</a></p>
<p><a href="./PnP.md">test</a></p>
<p><a href="./原理.md">test</a></p>
<p><a href="baidu.com">test</a></p>
<p><a href="www.baidu.com">test</a></p>
<p><a href="https://www.baidu.com">test</a></p>
```

and `example.js` like this:

```js
var vfile = require('to-vfile');
var attributes = require('rehype-attributes');
var rehype = require('rehype');

var mdReg = /(?:\.\/)?(.*)\.md$/;
var urlReg = /^(https?:\/\/)?[\w\-]+(\.[\w\-]+)+([\w\-.,@?^=%&:\/~+#]*[\w\-@?^=%&\/~+#])?$/;

rehype()
  .use(attributes, {
    a: function (node) {
      var { href, target } = transform(node);
      node.properties.href = href;
      node.properties.target = target;
    },
  })
  .process(vfile.readSync('example.html'), function (err, file) {
    if (err) throw err;
    console.log(String(file));
  });

function transform(node) {
  var href = node.properties.href;
  var target = node.properties.target;
  if (!href) {
    return { href, target };
  }
  var match = mdReg.exec(href);
  if (match) {
    return { href: encodeURIComponent(match[1]) };
  }
  match = urlReg.exec(href);
  if (match) {
    return {
      href: match[1] ? href : '//' + href,
      target: '_blank',
    };
  }
  return {
    href,
    target,
  };
}
```

Now, running `node example.js` yields:

```
<p><a href="build%2FPnP">test</a></p>
<p><a href="build%2FPnP">test</a></p>
<p><a href="PnP">test</a></p>
<p><a href="PnP">test</a></p>
<p><a href="%E5%8E%9F%E7%90%86">test</a></p>
<p><a href="//baidu.com" target="_blank">test</a></p>
<p><a href="//www.baidu.com" target="_blank">test</a></p>
<p><a href="https://www.baidu.com" target="_blank">test</a></p>
```
