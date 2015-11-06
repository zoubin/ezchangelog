var thr = require('through2')
var exec = require('child_process').exec

module.exports = function () {
  var commitDir = getCommitDir()

  function wrapLink(text, hash) {
    return commitDir.then(function (r) {
      return r && linkMD(text, r + hash) || text
    })
  }

  function titleMD(tag, hash, date) {
    return wrapLink(tag, hash)
      .then(function (link) {
        var text = ['## ', link, ' (']
        text.push(dateToString(date))
        text.push(')', '\n\n')
        return text.join('')
      })
  }

  function dateToString(date) {
    return date.toISOString().slice(0, 10)
  }

  function bodyMD(hash, sub, body, date) {
    return wrapLink(hash, hash)
      .then(function (link) {
        var text = [
          '* [ ', dateToString(date), ' ', link, ' ] ',
          sub, '\n\n',
        ]
        if (body) {
          text.push(
            '  >',
            body.trim().replace(/\n/g, '\n\n  >'),
            '\n\n'
          )
        }
        return text.join('')
      })
  }

  return thr.obj(function (ci, _, next) {
    var md
    var hash = ci.commit.short
    if (ci.tag) {
      md = titleMD(ci.tag, hash, ci.committer.date)
    } else {
      md = bodyMD(hash, ci.subject, ci.body, ci.committer.date)
    }
    md.then(function (s) {
      next(null, s)
    })
  })
}

function linkMD(text, href) {
  return '[' + text + '](' + href + ')'
}

function getCommitDir() {
  return new Promise(function (resolve) {
    var dir = require('./config')().commits
    if (dir.slice(-1) !== '/') {
      dir += '/'
    }
    resolve(dir)
  })
  .catch(getGithubCommitDir)
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

