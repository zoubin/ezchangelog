var thr = require('through2')
var splicer = require('labeled-stream-splicer')
var formatter = require('./formatter')

var HEADER_PREFIX = '<!-- LATEST '
var HEADER_SUFFIX = ' -->\n\n'
var HASH_OFFSET = HEADER_PREFIX.length

module.exports = function (opts) {
  var history = opts && opts.history
  var header
  var hasNewHeader = false
  var lastCommit = getLastCommit(history)

  function filter(ci, _, next) {
    if (lastCommit && lastCommit === ci.commit.short) {
      return this.push(null)
    }
    next(null, ci)
  }

  function collectHeader(ci, _, next) {
    if (!header) {
      header = getHeader(ci.commit.short)
    }
    next(null, ci)
  }

  function pushHeader(buf, _, next) {
    if (!hasNewHeader && header) {
      hasNewHeader = true
      this.push(header)
    }
    next(null, buf)
  }

  function prepend(s, _, next) {
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

  return splicer.obj([
    'filter', [ thr.obj(filter) ],
    'header', [ thr.obj(collectHeader) ],
    'format', [ formatter() ],
    'pushHeader', [ thr(pushHeader) ],
    'wrap', [ thr(prepend, append) ],
  ])
}

function getHeader(hash) {
  return HEADER_PREFIX + hash + HEADER_SUFFIX
}

function hasHeader(s) {
  return s && s.substring(0, HASH_OFFSET) === HEADER_PREFIX
}

function getLastCommit(history) {
  return history &&
    hasHeader(history) &&
    history.substring(HASH_OFFSET, HASH_OFFSET + 7)
}

