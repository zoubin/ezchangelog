var thr = require('through2')

module.exports = function (opts) {
  var baseUrl = opts && opts.baseUrl
  if (!baseUrl) {
    return thr.obj()
  }
  if (baseUrl.slice(-1) !== '/') {
    baseUrl += '/'
  }
  return thr.obj(function (ci, _, next) {
    ci.url = baseUrl + ci.commit.short
    next(null, ci)
  })
}

