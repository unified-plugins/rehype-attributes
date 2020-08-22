var util = require('./lib');

module.exports = attributes;

function attributes(options) {
  var settings = options || {};

  return transformer;

  function transformer(node) {
    util(node, settings);
  }
}
