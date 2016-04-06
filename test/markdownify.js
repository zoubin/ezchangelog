var test = require('tap').test
var formatter = require('../lib/markdownify')
var path = require('path')
var fixtures = path.resolve.bind(path, __dirname, 'fixtures')
var fs = require('fs')
var concat = require('concat-stream')
var rows = require(fixtures('commit.expected'))

test('markdownify, has link', function(t) {
  t.plan(1)
  var expected = fs.readFileSync(
    fixtures('markdownify.link.expected.md'), 'utf8'
  )
  var stream = formatter()
  stream.pipe(concat({ encoding: 'string' }, function (md) {
    t.equal(md, expected)
  }))
  rows.forEach(function (row) {
    stream.write(row)
  })
  stream.end()
})

test('markdownify, has no link', function(t) {
  t.plan(1)
  var expected = fs.readFileSync(
    fixtures('markdownify.expected.md'), 'utf8'
  )
  var stream = formatter()
  stream.pipe(concat({ encoding: 'string' }, function (md) {
    t.equal(md, expected)
  }))
  rows.forEach(function (row) {
    row = Object.create(row)
    row.url = null
    stream.write(row)
  })
  stream.end()
})

