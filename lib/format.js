var thr = require('through2')
var combine = require('stream-combiner2')
var stringify = require('./stringify')

var HEADER_PREFIX = '<!-- LATEST '
var HEADER_SUFFIX = ' -->\n\n'
var HASH_OFFSET = HEADER_PREFIX.length

module.exports = function (history) {
  var header
  var hasNewHeader = false
  var lastCommit = history && getLastCommit(history)

  function prepend(s, _, next) {
    if (!hasNewHeader && header) {
      hasNewHeader = true
      this.push(header)
    }
    next(null, s)
  }

  function append(done) {
    if (history) {
      if (hasNewHeader && hasHeader(history)) {
        this.push(history.substring(header.length))
      } else {
        this.push(history)
      }
    }
    done()
  }

  function filter(ci, _, next) {
    var hash = ci.commit.short
    if (lastCommit && lastCommit === hash) {
      return this.push(null)
    }
    if (!header) {
      header = getHeader(hash)
    }
    next(null, ci)
  }

  return combine.obj([
    thr.obj(filter),
    stringify(),
    thr(prepend, append),
  ])
}

function getHeader(hash) {
  return HEADER_PREFIX + hash + HEADER_SUFFIX
}

function hasHeader(s) {
  return s && s.substring(0, HASH_OFFSET) === HEADER_PREFIX
}

function getLastCommit(history) {
  return hasHeader(history) && history.substring(HASH_OFFSET, HASH_OFFSET + 7)
}

