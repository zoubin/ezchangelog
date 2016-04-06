var through = require('through2')

var HEADER_REGEX = /^<!-- (\w{7}) (\d+) -->\n\n/

function nameStream(name, stream) {
  stream.label = name
  return stream
}

module.exports = function (c, opts) {
  opts = opts || {}

  var history = opts.history
  var matches = history && history.match(HEADER_REGEX)
  var latestCommitDate = 0
  if (matches) {
    latestCommitDate = new Date(+matches[2])
  }

  var header
  var hasHeader = !!matches
  var headerAdded = false

  c.pipeline.get('format').unshift(nameStream(
    'incrementalize.filter',
    through.obj(function (ci, enc, next) {
      if (latestCommitDate >= ci.committer.date) {
        return next()
      }
      if (!header) {
        header = createHeader(ci)
      }
      next(null, ci)
    })
  ))

  c.pipeline.get('format').push(nameStream(
    'incrementalize.append',
    through.obj(
      function (buf, _, next) {
        if (!headerAdded && header) {
          // add the new header
          headerAdded = true
          this.push(header)
        }
        next(null, buf)
      },
      function (next) {
        if (!history) {
          return next()
        }
        if (header && hasHeader) {
          // both old and new header exist, discard the old
          this.push(history.substring(header.length))
        } else {
          // there are no new commits,
          // or there is no old header
          this.push(history)
        }
        next()
      }
    )
  ))
}

function createHeader(ci) {
  return '<!-- ' + ci.commit.short + ' ' + +ci.committer.date + ' -->\n\n'
}

