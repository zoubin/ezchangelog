var split = require('split2')
var combine = require('stream-combiner2')
var thr = require('through2')
var exec = require('child_process').exec

module.exports = function () {
  return combine.obj(split(), parse())
}

function parse() {
  var commit
  var tags = getTagList()
  var stream = thr.obj(write, end)
  function push(ci) {
    var messages = ci.messages.map(function (s) {
      return s.trim()
    }).filter(Boolean)
    ci.subject = messages[0]
    ci.body = messages.slice(1).join('\n')
    stream.push(ci)
  }
  function write(buf, _, next) {
    var msg = buf.toString('utf8')

    var hash = parseHash(msg)
    if (hash) {
      if (commit) {
        push(commit)
      }
      return tags.then(function (tag) {
        commit = {
          commit: {
            long: hash,
            short: hash.slice(0, 7),
          },
          tag: tag[hash],
          messages: [],
          committer: {},
        }
        next()
      })
    }

    var committer = parseCommitter(msg)
    if (committer) {
      commit.committer = committer
      return next()
    }

    var date = parseDate(msg)
    if (date) {
      commit.committer.date = date
      return next()
    }

    commit.messages.push(msg)
    next()
  }
  function end(done) {
    if (commit) {
      push(commit)
    }
    done()
  }
  return stream
}

function parseHash(msg) {
  var info = msg.split(/\s+/)
  if (info[0] === 'commit') {
    return info[1]
  }
  return null
}

function parseCommitter(msg) {
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

function getTagList() {
  return new Promise(function (resolve) {
    exec('git tag -l', function (err, lines) {
      var tags = []
      if (lines) {
        tags = lines.split('\n')
          .map(function (s) {
            return s.trim()
          })
          .filter(Boolean)
      }
      resolve(tags)
    })
  })
  .then(function (tags) {
    return tags.map(resolveTagHash)
  })
  .then(Promise.all.bind(Promise))
  .then(function (tags) {
    return tags.reduce(function (o, tag) {
      if (tag.hash) {
        o[tag.hash] = tag.name
      }
      return o
    }, {})
  })
}

function resolveTagHash(tag) {
  return new Promise(function (resolve) {
    exec('git show-ref --dereference ' + tag + ' | tail -n1 | awk \'{print $1}\'', function (err, line) {
      var hash = ''
      if (line) {
        hash = line.trim()
      }
      resolve({ name: tag, hash: hash })
    })
  })
}

