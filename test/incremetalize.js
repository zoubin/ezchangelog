var test = require('tap').test
var changelog = require('..')
var path = require('path')
var fixtures = path.resolve.bind(path, __dirname, 'fixtures')
var fs = require('fs')
var concat = require('concat-stream')
var incrementalize = require('../lib/incrementalize')

test('incremental', function(t) {
  t.plan(1)
  var history = fs.readFileSync(
    fixtures('expected.md'), 'utf8'
  )
  var expected = fs.readFileSync(
    fixtures('incremental.expected.md'), 'utf8'
  )
  fs.createReadStream(fixtures('sample.incremental'))
    .pipe(changelog({
      baseUrl: 'https://github.com/zoubin/ezchangelog/commit/',
      plugin: [[incrementalize, { history: history }]],
    }))
    .pipe(concat({ encoding: 'string' }, function (md) {
      t.equal(md, expected)
    }))
})

test('incremental, empty', function(t) {
  t.plan(1)
  var history = fs.readFileSync(
    fixtures('incremental.expected.md'), 'utf8'
  )
  var expected = fs.readFileSync(
    fixtures('incremental.expected.md'), 'utf8'
  )
  fs.createReadStream(fixtures('sample.incremental'))
    .pipe(changelog({
      baseUrl: 'https://github.com/zoubin/ezchangelog/commit/',
      plugin: [[incrementalize, { history: history }]],
    }))
    .pipe(concat({ encoding: 'string' }, function (md) {
      t.equal(md, expected)
    }))
})

