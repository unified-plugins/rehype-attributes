module.exports = search;

var visit = require('unist-util-visit');
var isElement = require('hast-util-is-element');

function search(root, settings) {
  var hits = Object.keys(settings);

  visit(root, 'element', handler);

  function handler(child, index, parent) {
    if (isElement(child, hits)) {
      var callback = settings[child.tagName];
      if (typeof callback === 'function') {
        callback(child)
      }
    }
  }
}
