var test = require('tap').test
var format = require('../lib/format')
var path = require('path')
var fixtures = path.resolve.bind(path, __dirname, 'fixtures')
var fs = require('fs')
var concat = require('concat-stream')

test('format, no incremental', function(t) {
  t.plan(1)
  var expected = fs.readFileSync(
    fixtures('format.no.incremental.expected.md'), 'utf8'
  )
  var stream = format()
  stream.pipe(concat({ encoding: 'string' }, function (md) {
    t.equal(md, expected)
  }))
  var rows = require(fixtures('sample.commit.expected'))
  rows.forEach(function (row) {
    stream.write(row)
  })
  stream.end()
})

test('format, incremental', function(t) {
  t.plan(1)
  var history = fs.readFileSync(
    fixtures('format.no.incremental.expected.md'), 'utf8'
  )
  var expected = fs.readFileSync(
    fixtures('format.incremental.expected.md'), 'utf8'
  )
  var stream = format({ history: history })
  stream.pipe(concat({ encoding: 'string' }, function (md) {
    t.equal(md, expected)
  }))
  var rows = require(fixtures('sample.incremental.commit.expected'))
  rows.forEach(function (row) {
    stream.write(row)
  })
  stream.end()
})

test('format, incremental, empty', function(t) {
  t.plan(1)
  var history = fs.readFileSync(
    fixtures('format.incremental.expected.md'), 'utf8'
  )
  var expected = fs.readFileSync(
    fixtures('format.incremental.expected.md'), 'utf8'
  )
  var stream = format({ history: history })
  stream.pipe(concat({ encoding: 'string' }, function (md) {
    t.equal(md, expected)
  }))
  var rows = require(fixtures('sample.incremental.commit.expected'))
  rows.forEach(function (row) {
    stream.write(row)
  })
  stream.end()
})

