var thr = require('through2')
var split = require('split2')
var combine = require('stream-combiner2')

module.exports = function () {
  return combine.obj(split(), parser())
}

function parser() {
  var commit
  function push(stream, ci) {
    ci.message = ci.message.join('\n')
    stream.push(ci)
  }
  return thr.obj(function (buf, _, next) {
    var msg = buf.toString('utf8')

    var hash = parseHash(msg)
    if (hash) {
      if (commit) {
        push(this, commit)
      }
      commit = { hash: hash, message: [] }
      return next()
    }

    var author = parseAuthor(msg)
    if (author) {
      commit.author = author
      return next()
    }

    var date = parseDate(msg)
    if (date) {
      commit.date = date
      return next()
    }

    commit.message.push(msg)
    next()
  }, function (done) {
    if (commit) {
      push(this, commit)
    }
    done()
  })
}

function parseHash(msg) {
  var info = msg.split(/\s+/)
  if (info[0] === 'commit') {
    return info[1]
  }
  return null
}

function parseAuthor(msg) {
  var info = msg.split(/\s+/)
  if (info[0] === 'Author:') {
    return {
      name: info.slice(1, -1).join(' '),
      email: info[info.length - 1].slice(1, -1),
    }
  }
  return null
}

function parseDate(msg) {
  var info = msg.split(/\s+/)
  if (info[0] === 'Date:') {
    return new Date(info.slice(1).join(' '))
  }
  return null
}

