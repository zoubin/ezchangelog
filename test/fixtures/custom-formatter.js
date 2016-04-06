var through = require('through2')

module.exports = function (c) {
  c.pipeline.get('parse').push(through.obj(function (ci, enc, next) {
    // parse the author name from: 'zoubin <zoubin04@gmail.com>'
    ci.committer.author = ci.headers[0][1].split(/\s+/)[0]
    next(null, ci)
  }))
  c.pipeline.get('format').splice('markdownify', 1, through.obj(function (ci, enc, next) {
    var sha1 = ci.commit.short
    sha1 = '[`' + sha1 + '`](' + c._options.baseUrl + sha1 + ')'
    var date = ci.committer.date.toISOString().slice(0, 10)
    next(null, '* ' + sha1 + ' ' + date + ' @' + ci.committer.author + '\n')
  }))
}

