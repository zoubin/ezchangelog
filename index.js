var path = require('path')
var split = require('split2')
var resolve = require('resolve')
var splicer = require('labeled-stream-splicer')

var commit = require('./lib/parser/commit')
var url = require('./lib/parser/url')
var tag = require('./lib/parser/tag')
var markdownify = require('./lib/markdownify')

function Changelog(opts) {
  opts = opts || {}
  this._options = opts
  this.pipeline = splicer.obj([
    'parse', [
      'split', split(),
      'commit', commit(),
      'tag', tag(),
      'url', url({ baseUrl: opts.baseUrl }),
    ],
    'format', [
      'markdownify', markdownify(),
    ],
  ])

  ;[].concat(opts.plugin).filter(Boolean).forEach(function (p) {
    this.plugin(p)
  }, this)
}

Changelog.prototype.plugin = function (p, opts) {
  if (Array.isArray(p)) {
    opts = p[1]
    p = p[0]
  }
  if (typeof p === 'string') {
    p = require(this.resolve(p))
  }
  p(this, opts)
  return this
}

Changelog.prototype.resolve = function (id) {
  var parent = { basedir: process.cwd() }
  try {
    return resolve.sync(id, parent)
  } catch (e) {
    return resolve.sync(path.resolve(id), parent)
  }
}

module.exports = function (opts) {
  return new Changelog(opts).pipeline
}
module.exports.Changelog = Changelog

