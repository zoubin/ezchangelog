var thr = require('through2')
var exec = require('child_process').exec
var combine = require('stream-combiner2')

module.exports = function (history) {
  var lastCommit = history && getLastCommit(history)
  return combine.obj(
    lastCommit ? filter(lastCommit) : thr.obj(),
    toMarkdown(),
    history ? prepend(history) : thr()
  )
}

function prepend(history) {
  return thr(function (buf, _, next) {
    next(null, buf)
  }, function (done) {
    this.push(history)
    done()
  })
}

function toMarkdown() {
  var tagList

  function push(ci, next) {
    var msg
    if (tagList[ci.hash]) {
      ci = tagList[ci.hash]
      msg = '## ' + ci.tag + ' (' + getDate(ci.time) + ')' + '\n'
    } else {
      msg = '* ' + ci.date.toISOString() + '\n' + ci.message.replace(/\n/g, '\n\n')
    }
    next(null, msg + '\n')
  }

  return thr.obj(function (ci, _, next) {
    if (tagList) {
      return push(ci, next)
    }
    var self = this
    getTagList()
      .then(function (list) {
        tagList = list.reduce(function (o, c) {
          o[c.hash] = c
          return o
        }, {})
        self.push('<!-- commit ' + ci.hash + ' -->\n\n')
        push(ci, next)
      })
  })
}

function getDate(time) {
  var d = new Date(+(time + '000'))
  return d.toISOString().slice(0, 10)
}

function filter(lastCommit) {
  return thr.obj(function (ci, _, next) {
    if (lastCommit === ci.hash) {
      return this.push(null)
    }
    next(null, ci)
  })
}

function getLastCommit(history) {
  // <!-- commit d4bf4dbae5cedc8d9194d7357c3750f88f7d5759 -->
  var i = history.indexOf('\n')
  if (i !== -1) {
    var header = '<!-- commit '
    var line = history.substring(0, i)
    if (line.indexOf(header) === 0) {
      return line.substring(header.length, header.length + 40)
    }
  }
  return null
}

function getTagList() {
  return getTags()
    .then(function (tags) {
      return tags.map(parseTag)
    })
    .then(Promise.all.bind(Promise))
}

function getTags() {
  return new Promise(function (resolve, reject) {
    exec('git tag -l', function (err, stdout) {
      if (err) {
        return reject(err)
      }
      resolve(
        stdout.toString('utf8').split('\n')
          .map(function (s) {
            return s.trim()
          })
          .filter(Boolean)
      )
    })
  })
}

function parseTag(tag) {
  return new Promise(function (resolve) {
    exec('git tag -v ' + tag, function (err, stdout) {
      var s = stdout.toString('utf8').split('\n')
      var tagger = s[3].split(/\s+/)
      resolve({
        hash: s[0].split(/\s+/)[1],
        tag: tag,
        time: tagger[tagger.length - 2],
      })
    })
  })
}

