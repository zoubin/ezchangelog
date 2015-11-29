var test = require('tap').test
var parser = require('..').parser.url
var concat = require('concat-stream')

test('url parser, no baseUrl', function(t) {
  t.plan(1)
  var stream = parser()
  stream.pipe(concat({ encoding: 'object' }, function (rows) {
    t.same(rows, [
      { commit: { short: '123' } },
      { commit: { short: '456' } },
    ])
  }))
  stream.write({ commit: { short: '123' } })
  stream.end({ commit: { short: '456' } })
})

test('url parser, trailing slash', function(t) {
  t.plan(1)
  var base = '/host/commit/'
  var stream = parser({ baseUrl: base })
  stream.pipe(concat({ encoding: 'object' }, function (rows) {
    t.same(rows, [
      { commit: { short: '123' }, url: base + '123' },
      { commit: { short: '456' }, url: base + '456' },
    ])
  }))
  stream.write({ commit: { short: '123' } })
  stream.end({ commit: { short: '456' } })
})

test('url parser, no trailing slash', function(t) {
  t.plan(1)
  var base = '/host/commit'
  var stream = parser({ baseUrl: base })
  stream.pipe(concat({ encoding: 'object' }, function (rows) {
    t.same(rows, [
      { commit: { short: '123' }, url: base + '/123' },
      { commit: { short: '456' }, url: base + '/456' },
    ])
  }))
  stream.write({ commit: { short: '123' } })
  stream.end({ commit: { short: '456' } })
})

