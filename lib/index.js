module.exports = attributes;

var replace = require('./replace');

function attributes(node, options) {
  var settings = options || {};

  replace(node, settings);

  return node;
}
