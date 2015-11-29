var thr = require('through2')

module.exports = function () {
  return thr.obj(function (ci, _, next) {
    if (ci.tag) {
      this.push(formatTag(ci))
    } else {
      this.push(formatMsg(ci))
    }
    this.push('\n\n')
    next()
  })
}

function formatTag(ci) {
  var prelude = ci.tag
  if (ci.url) {
    prelude = linkify(prelude, ci.url)
  }
  return '## ' + prelude + ' (' + formatDate(ci.committer.date) + ')'
}

function formatMsg(ci) {
  var prelude = ''
  if (ci.url) {
    prelude = '[ ' + linkify(ci.commit.short, ci.url) + ' ] '
  }
  return '* ' + prelude + [ci.subject, ci.body].filter(Boolean).join('\n\n')
}

function formatDate(d) {
  return d.toISOString().slice(0, 10)
}

function linkify(text, href) {
  return '[' + text + '](' + href + ')'
}

