var test = require('tap').test
var parser = require('..').parser.line
var path = require('path')
var fixtures = path.resolve.bind(path, __dirname, 'fixtures')
var split = require('split2')
var fs = require('fs')
var sample = fixtures('sample')

var expected = [
  '9c5829ce45567bedccda9beb7f5de17574ea9437',
  { name: 'Author', value: 'zoubin <zoubin04@gmail.com>' },
  { name: 'Date', value: 'Sat Nov 7 18:42:35 2015 +0800' },
  { raw: '' },
  { raw: '    CHANGELOG' },
  { raw: '' },

  '3bf9055b732cc23a9c14f295ff91f48aed5ef31a',
  { name: 'Author', value: 'zoubin <zoubin04@gmail.com>' },
  { name: 'Date', value: 'Sat Nov 7 18:41:37 2015 +0800' },
  { raw: '' },
  { raw: '    4.0.3' },
  { raw: '' },

  '87abe8e12374079f73fc85c432604642059806ae',
  { name: 'Author', value: 'zoubin <zoubin04@gmail.com>' },
  { name: 'Date', value: 'Sat Nov 7 18:41:32 2015 +0800' },
  { raw: '' },
  { raw: '    fix readme' },
  { raw: '    add more tests' },
  { raw: '' },
]

test('line parser', function(t) {
  t.plan(1)
  var stream = parser()
  var res = []
  stream.on('commit', function (data) {
    res.push(data.hash)
  })
  stream.on('header', function (data) {
    res.push({ name: data.name, value: data.value })
  })
  stream.on('message', function (data) {
    res.push(data)
  })
  stream.on('finish', function () {
    t.same(res, expected)
  })

  fs.createReadStream(sample)
    .pipe(split())
    .pipe(stream)
})

