var test = require('tap').test
var parser = require('../lib/parser/commit')
var path = require('path')
var fixtures = path.resolve.bind(path, __dirname, 'fixtures')
var split = require('split2')
var fs = require('fs')
var sample = fixtures('sample')
var concat = require('concat-stream')
var expected = require(fixtures('commit.expected'))

test('commit parser', function(t) {
  var fields = ['commit', 'commmiter', 'messages', 'headers', 'subject', 'body']
  t.plan(fields.length)
  fs.createReadStream(sample)
    .pipe(split())
    .pipe(parser())
    .pipe(concat({ encoding: 'object' }, function (rows) {
      fields.forEach(function (field) {
        t.same(
          rows.map(function (row) {
            return row[field]
          }),
          expected.map(function (row) {
            return row[field]
          }),
          field
        )
      })
    }))
})

