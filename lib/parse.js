var split = require('split2')
var combine = require('stream-combiner2')
var thr = require('through2')

module.exports = function (opts) {
  opts = opts || {}
  var parser = typeof opts.parser === 'function'
    ? opts.parser
    : require('./parser')

  return combine.obj(split(), group(), parser(opts))
}

function group() {
  var ci
  var COMMIT_LINE = /^commit \w{40}$/
  return thr.obj(function (buf, _, next) {
    var line = buf.toString('utf8')
    if (COMMIT_LINE.test(line)) {
      if (ci) {
        this.push(ci)
      }
      ci = { raws: [ line ] }
    } else if (ci) {
      ci.raws.push(line)
    }
    next()
  }, function (done) {
    if (ci) {
      this.push(ci)
    }
    done()
  })
}
