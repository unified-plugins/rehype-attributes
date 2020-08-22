(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.rehypeAttributes = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
module.exports = attributes;

var replace = require('./replace');

function attributes(node, options) {
  var settings = options || {};

  replace(node, settings);

  return node;
}

},{"./replace":2}],2:[function(require,module,exports){
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

},{"hast-util-is-element":4,"unist-util-visit":8}],3:[function(require,module,exports){
'use strict'

module.exports = convert

function convert(test) {
  if (typeof test === 'string') {
    return tagNameFactory(test)
  }

  if (test === null || test === undefined) {
    return element
  }

  if (typeof test === 'object') {
    return any(test)
  }

  if (typeof test === 'function') {
    return callFactory(test)
  }

  throw new Error('Expected function, string, or array as test')
}

function convertAll(tests) {
  var length = tests.length
  var index = -1
  var results = []

  while (++index < length) {
    results[index] = convert(tests[index])
  }

  return results
}

function any(tests) {
  var checks = convertAll(tests)
  var length = checks.length

  return matches

  function matches() {
    var index = -1

    while (++index < length) {
      if (checks[index].apply(this, arguments)) {
        return true
      }
    }

    return false
  }
}

// Utility to convert a string a tag name check.
function tagNameFactory(test) {
  return tagName

  function tagName(node) {
    return element(node) && node.tagName === test
  }
}

// Utility to convert a function check.
function callFactory(test) {
  return call

  function call(node) {
    return element(node) && Boolean(test.apply(this, arguments))
  }
}

// Utility to return true if this is an element.
function element(node) {
  return (
    node &&
    typeof node === 'object' &&
    node.type === 'element' &&
    typeof node.tagName === 'string'
  )
}

},{}],4:[function(require,module,exports){
'use strict'

var convert = require('./convert')

module.exports = isElement

isElement.convert = convert

// Check if if `node` is an `element` and whether it passes the given test.
function isElement(node, test, index, parent, context) {
  var hasParent = parent !== null && parent !== undefined
  var hasIndex = index !== null && index !== undefined
  var check = convert(test)

  if (
    hasIndex &&
    (typeof index !== 'number' || index < 0 || index === Infinity)
  ) {
    throw new Error('Expected positive finite index for child node')
  }

  if (hasParent && (!parent.type || !parent.children)) {
    throw new Error('Expected parent node')
  }

  if (!node || !node.type || typeof node.type !== 'string') {
    return false
  }

  if (hasParent !== hasIndex) {
    throw new Error('Expected both parent and index')
  }

  return check.call(context, node, index, parent)
}

},{"./convert":3}],5:[function(require,module,exports){
'use strict'

module.exports = convert

function convert(test) {
  if (typeof test === 'string') {
    return typeFactory(test)
  }

  if (test === null || test === undefined) {
    return ok
  }

  if (typeof test === 'object') {
    return ('length' in test ? anyFactory : matchesFactory)(test)
  }

  if (typeof test === 'function') {
    return test
  }

  throw new Error('Expected function, string, or object as test')
}

function convertAll(tests) {
  var results = []
  var length = tests.length
  var index = -1

  while (++index < length) {
    results[index] = convert(tests[index])
  }

  return results
}

// Utility assert each property in `test` is represented in `node`, and each
// values are strictly equal.
function matchesFactory(test) {
  return matches

  function matches(node) {
    var key

    for (key in test) {
      if (node[key] !== test[key]) {
        return false
      }
    }

    return true
  }
}

function anyFactory(tests) {
  var checks = convertAll(tests)
  var length = checks.length

  return matches

  function matches() {
    var index = -1

    while (++index < length) {
      if (checks[index].apply(this, arguments)) {
        return true
      }
    }

    return false
  }
}

// Utility to convert a string into a function which checks a given node’s type
// for said string.
function typeFactory(test) {
  return type

  function type(node) {
    return Boolean(node && node.type === test)
  }
}

// Utility to return true.
function ok() {
  return true
}

},{}],6:[function(require,module,exports){
module.exports = identity
function identity(d) {
  return d
}

},{}],7:[function(require,module,exports){
'use strict'

module.exports = visitParents

var convert = require('unist-util-is/convert')
var color = require('./color')

var CONTINUE = true
var SKIP = 'skip'
var EXIT = false

visitParents.CONTINUE = CONTINUE
visitParents.SKIP = SKIP
visitParents.EXIT = EXIT

function visitParents(tree, test, visitor, reverse) {
  var is

  if (func(test) && !func(visitor)) {
    reverse = visitor
    visitor = test
    test = null
  }

  is = convert(test)

  one(tree, null, [])()

  function one(child, index, parents) {
    var value = object(child) ? child : {}
    var name

    if (string(value.type)) {
      name = string(value.tagName)
        ? value.tagName
        : string(value.name)
        ? value.name
        : undefined

      node.displayName =
        'node (' + color(value.type + (name ? '<' + name + '>' : '')) + ')'
    }

    return node

    function node() {
      var result = []
      var subresult

      if (!test || is(child, index, parents[parents.length - 1] || null)) {
        result = toResult(visitor(child, parents))

        if (result[0] === EXIT) {
          return result
        }
      }

      if (!child.children || result[0] === SKIP) {
        return result
      }

      subresult = toResult(children(child.children, parents.concat(child)))
      return subresult[0] === EXIT ? subresult : result
    }
  }

  // Visit children in `parent`.
  function children(children, parents) {
    var min = -1
    var step = reverse ? -1 : 1
    var index = (reverse ? children.length : min) + step
    var child
    var result

    while (index > min && index < children.length) {
      child = children[index]
      result = one(child, index, parents)()

      if (result[0] === EXIT) {
        return result
      }

      index = typeof result[1] === 'number' ? result[1] : index + step
    }
  }
}

function toResult(value) {
  if (object(value) && 'length' in value) {
    return value
  }

  if (typeof value === 'number') {
    return [CONTINUE, value]
  }

  return [value]
}

function func(d) {
  return typeof d === 'function'
}

function string(d) {
  return typeof d === 'string'
}

function object(d) {
  return typeof d === 'object' && d !== null
}

},{"./color":6,"unist-util-is/convert":5}],8:[function(require,module,exports){
'use strict'

module.exports = visit

var visitParents = require('unist-util-visit-parents')

var CONTINUE = visitParents.CONTINUE
var SKIP = visitParents.SKIP
var EXIT = visitParents.EXIT

visit.CONTINUE = CONTINUE
visit.SKIP = SKIP
visit.EXIT = EXIT

function visit(tree, test, visitor, reverse) {
  if (typeof test === 'function' && typeof visitor !== 'function') {
    reverse = visitor
    visitor = test
    test = null
  }

  visitParents(tree, test, overload, reverse)

  function overload(node, parents) {
    var parent = parents[parents.length - 1]
    var index = parent ? parent.children.indexOf(node) : null
    return visitor(node, index, parent)
  }
}

},{"unist-util-visit-parents":7}],9:[function(require,module,exports){
var util = require('./lib');

module.exports = attributes;

function attributes(options) {
  var settings = options || {};

  return transformer;

  function transformer(node) {
    util(node, settings);
  }
}

},{"./lib":1}]},{},[9])(9)
});
