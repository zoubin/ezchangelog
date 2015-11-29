var thr = require('through2')
var exec = require('../exec')

module.exports = function () {
  var tags = getTags()
  return thr.obj(function (ci, _, next) {
    tags.then(function (o) {
      ci.tag = o[ci.commit.long]
      next(null, ci)
    })
  })
}

function getTags() {
  return exec('git tag -l')
    .then(function (lines) {
      return lines.split('\n').map(trim).filter(Boolean)
    })
    .then(function (tags) {
      return Promise.all(tags.map(resolveTagHash))
    })
    .then(function (tags) {
      return tags.reduce(function (o, tag) {
        o[tag.hash] = tag.name
        return o
      }, {})
    })
}

function resolveTagHash(tag) {
  return exec('git show-ref --dereference ' + tag + ' | tail -n1 | awk \'{print $1}\'')
  .then(function (line) {
    return {
      name: tag,
      hash: line.trim(),
    }
  })
}

function trim(s) {
  return s.trim()
}

