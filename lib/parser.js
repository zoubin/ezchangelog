var splicer = require('labeled-stream-splicer')
var thr = require('through2')
var getTags = require('./tags')
var exec = require('child_process').exec

module.exports = function (opts) {
  return splicer.obj([
    'hash', [ hashParser() ],
    'tag', [ tagParser() ],
    'url', [ urlParser(opts) ],
    'committer', [ committerParser() ],
    'message', [ messageParser() ],
  ])
}

function urlParser(opts) {
  opts = opts || {}
  var dir = opts.baseUrl && Promise.resolve(opts.baseUrl) || getGithubCommitDir()
  dir = dir.catch(function () {})
    .then(function (baseUrl) {
      if (baseUrl && baseUrl.slice(-1) !== '/') {
        baseUrl += '/'
      }
      return baseUrl
    })
  return thr.obj(function (ci, _, next) {
    dir.then(function (baseUrl) {
      if (baseUrl) {
        ci.url = baseUrl + ci.commit.short
      }
      next(null, ci)
    })
  })
}

function hashParser() {
  return thr.obj(function (ci, _, next) {
    ci.commit = {}
    ci.commit.long = ci.raws[0].slice(-40)
    ci.commit.short = ci.commit.long.slice(0, 7)
    next(null, ci)
  })
}

function committerParser() {
  var DATE_LINE = /^Date: /
  return thr.obj(function (ci, _, next) {
    var line = ci.raws.filter(function (msg) {
      return DATE_LINE.test(msg)
    })[0]
    if (line) {
      var parsed = line.split(/\s+/)
      ci.committer = {}
      ci.committer.date = new Date(parsed.slice(1).join(' '))
    }
    next(null, ci)
  })
}

function messageParser() {
  var BODY_LINE = /^\s+/
  return thr.obj(function (ci, _, next) {
    var lines = ci.raws.filter(function (msg) {
      return BODY_LINE.test(msg)
    })
    var body = []
    lines.forEach(function (line) {
      if (ci.subject) {
        return body.push(line)
      }
      ci.subject = line.trim()
    })
    ci.body = body.join('\n')
    next(null, ci)
  })
}

function tagParser() {
  var tags = getTags()
  var noop = function () {}
  return thr.obj(function (ci, _, next) {
    tags.then(function (o) {
      ci.tag = o[ci.commit.long]
    }, noop)
    .then(function () {
      next(null, ci)
    })
  })
}

function getGithubCommitDir() {
  return new Promise(function (resolve) {
    exec('git remote -v | head -n1', function (err, line) {
      if (!line) {
        return resolve()
      }
      var repo = line.split(/\s+/)[1]
      repo = repo.slice(repo.indexOf(':') + 1, -4)
      resolve(
        'https://github.com/' + repo + '/commit/'
      )
    })
  })
}

