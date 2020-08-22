var vfile = require('to-vfile');
var attributes = require('..');
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
  .process(vfile.readSync('tests/example.html'), function (err, file) {
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