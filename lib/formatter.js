var thr = require('through2')

module.exports = function () {
  return thr.obj(function (ci, _, next) {
    if (ci.tag) {
      this.push(formatTag(ci))
    } else {
      this.push(formatMsg(ci))
    }
    next(null, '\n\n')
  })
}

function formatTag(ci) {
  return '## ' + linkify(ci.tag, ci.url) +
    ' (' + formatDate(ci.committer.date) + ')'
}

function formatMsg(ci) {
  return '* [ ' + formatDate(ci.committer.date) +
    ' ' + linkify(ci.commit.short, ci.url) + ' ] ' +
    ci.subject.trim() + (ci.body ? '\n' + ci.body : '')
}

function formatDate(d) {
  return d.toISOString().slice(0, 10)
}

function linkify(text, href) {
  return href && '[' + text + '](' + href + ')' || text
}

