var fs = require('fs');
var path = require('path');
var unified = require('unified');
var rehypeAttributes = require('..');
var rehype = require('rehype-parse')
var sanitize = require('rehype-sanitize')
var schema = require('hast-util-sanitize/lib/github')
var format = require('rehype-format');
var html = require('rehype-stringify');
var report = require('vfile-reporter');

var mdReg = /(?:\.\/)?(.*)\.md$/;
var urlReg = /^(https?:\/\/)?[\w\-]+(\.[\w\-]+)+([\w\-.,@?^=%&:\/~+#]*[\w\-@?^=%&\/~+#])?$/;

unified()
  .use(rehype)
  .use(rehypeAttributes, {
    a: function (node) {
      var { href, target } = transform(node)
      node.properties.href = href
      node.properties.target = target
    }
  })
  .use(sanitize, schema)
  .use(html)
  .process(fs.readFileSync(path.resolve(__dirname, './example.html')), function (
    err,
    file,
  ) {
    console.log(String(file));
  });

function transform(node) {
  var href = node.properties.href
  var target = node.properties.target
  if (!href) {
    return {href, target}
  }
  var match = mdReg.exec(href)
  if (match) {
    return { href: encodeURIComponent(match[1]) }
  }
  match = urlReg.exec(href)
  if (match) {
    return {
      href: match[1] ? href : '//' + href,
      target: '_blank'
    }
  }
  return {
    href,
    target
  }
}
