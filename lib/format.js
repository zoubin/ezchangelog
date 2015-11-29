var thr = require('through2')
var splicer = require('labeled-stream-splicer')
var formatter = require('./formatter')

var HEADER_REGEX = /^<!-- (\w{7}) (\d+) -->\n\n/
var HEADER_PREFIX = '<!-- '
var HASH_OFFSET = HEADER_PREFIX.length

module.exports = function (opts) {
  opts = opts || {}
  var history = opts.history
  var header
  var hasHeader = history && history.substring(0, HASH_OFFSET) === HEADER_PREFIX
  var hasNewHeader
  var latest = getLastCommit(history)
  var markdownify = opts.formatter || formatter

  function filter(ci, _, next) {
    if (latest && latest.date >= ci.committer.date) {
      return next()
    }
    next(null, ci)
  }

  function collectHeader(ci, _, next) {
    if (!header) {
      header = buildHeader(ci)
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
      if (hasNewHeader && hasHeader) {
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
    'format', [ markdownify() ],
    'pushHeader', [ thr(pushHeader) ],
    'wrap', [ thr(prepend, append) ],
  ])
}

function buildHeader(ci) {
  return '<!-- ' + ci.commit.short + ' ' + +ci.committer.date + ' -->\n\n'
}

function getLastCommit(history) {
  if (!history) return {}
  var matches = history.match(HEADER_REGEX)
  if (!matches) return {}
  return {
    hash: matches[1],
    date: new Date(+matches[2]),
    raw: matches[0],
  }
}

