var thr = require('through2')

var COMMIT_REGEX = /^commit\s+(\w+)$/
var HEADER_REGEX = /^(\w+):\s+(.+)$/

module.exports = function () {
  return thr.obj(function (line, _, next) {
    line = line.toString('utf8')
    var matches
    if (matches = line.match(COMMIT_REGEX)) {
      this.emit('commit', {
        raw: matches[0],
        hash: matches[1],
      })
    } else if (matches = line.match(HEADER_REGEX)) {
      this.emit('header', {
        raw: matches[0],
        name: matches[1],
        value: matches[2],
      })
    } else {
      this.emit('message', { raw: line })
    }
    next()
  })
}
