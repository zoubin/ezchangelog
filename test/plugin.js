var test = require('tap').test
var changelog = require('..')
var path = require('path')
var fixtures = path.resolve.bind(path, __dirname, 'fixtures')
var fs = require('fs')
var concat = require('concat-stream')

test('plugin', function(t) {
  t.plan(1)
  var expected = fs.readFileSync(
    fixtures('custom-formatter.expected.md'), 'utf8'
  )
  fs.createReadStream(fixtures('sample'))
    .pipe(changelog({
      baseUrl: 'https://github.com/zoubin/ezchangelog/commit/',
      plugin: 'test/fixtures/custom-formatter',
    }))
    .pipe(concat({ encoding: 'string' }, function (md) {
      t.equal(md, expected)
    }))
})

