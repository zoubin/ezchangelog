var test = require('tap').test
var parser = require('..').parser.tag
var concat = require('concat-stream')

var expected = [
  {
    commit: { long: '9c5829ce45567bedccda9beb7f5de17574ea9437' },
    tag: null,
  },
  {
    commit: { long: '3bf9055b732cc23a9c14f295ff91f48aed5ef31a' },
    tag: 'v4.0.3',
  },
  {
    commit: { long: '87abe8e12374079f73fc85c432604642059806ae' },
    tag: null,
  },
]

test('tag parser', function(t) {
  t.plan(1)
  var stream = parser()
  stream.pipe(concat({ encoding: 'object' }, function (rows) {
    t.same(rows, expected)
  }))
  stream.write({ commit: { long: '9c5829ce45567bedccda9beb7f5de17574ea9437' } })
  stream.write({ commit: { long: '3bf9055b732cc23a9c14f295ff91f48aed5ef31a' } })
  stream.write({ commit: { long: '87abe8e12374079f73fc85c432604642059806ae' } })
  stream.end()
})

