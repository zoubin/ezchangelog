var test = require('tap').test
var parse = require('..').parse
var path = require('path')
var fixtures = path.resolve.bind(path, __dirname, 'fixtures')
var fs = require('fs')
var sample = fixtures('sample')
var concat = require('concat-stream')
var expected = require(fixtures('sample.commit.expected'))

test('parse', function(t) {
  var fields = Object.keys(expected)
  t.plan(fields.length)
  fs.createReadStream(sample)
    .pipe(parse({ baseUrl: 'https://github.com/zoubin/ezchangelog/commit/' }))
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
