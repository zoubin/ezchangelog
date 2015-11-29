var thr = require('through2')
var duplexer = require('duplexer2')
var lineParser = require('./line')

module.exports = function () {
  var parser = lineParser()
  var output = thr.obj()
  var row

  parser.on('commit', function (res) {
    if (row) {
      output.push(row)
    }
    row = {
      commit: {
        long: res.hash,
        short: res.hash.slice(0, 7),
      },
      subject: '',
      body: '',
      committer: {},
      messages: [],
      headers: [],
    }
  })

  parser.on('header', function (res) {
    if (res.name === 'Date') {
      row.committer.date = new Date(res.value)
    }
    row.headers.push([res.name, res.value])
  })

  parser.on('message', function (res) {
    if (row.subject) {
      row.body = [row.body, res.raw].filter(Boolean).join('\n')
    } else {
      row.subject = res.raw.trim()
    }
    row.messages.push(res.raw)
  })

  parser.on('finish', function () {
    if (row) {
      output.push(row)
    }
    output.push(null)
  })

  return duplexer({ objectMode: true }, parser, output)
}

