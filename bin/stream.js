#!/usr/bin/env node

var fs = require('fs')
var minimist = require('minimist')
var parser = require('../lib/parser')
var format = require('../lib/format')

var argv = minimist(
  process.argv.slice(2),
  {
    string: ['file'],
    boolean: ['print'],
    alias: {
      p: 'print',
      f: 'file',
    },
  }
)

Promise.resolve(argv.file)
.then(function (file) {
  if (file) {
    return file
  }
  return require('../lib/config')().changelog
})
.catch(function () {
})
.then(function (file) {
  file = file || 'changelog.md'
  return readFile(file)
    .then(function (src) {
      return { file: file, source: src }
    })
})
.then(function (row) {
  var dest = argv.print
    ? process.stdout
    : fs.createWriteStream(row.file)
  process.stdin
    .pipe(parser())
    .pipe(format(row.source))
    .pipe(dest)
})

function readFile(file) {
  return new Promise(function (resolve) {
    fs.readFile(file, 'utf8', function (err, s) {
      resolve(s)
    })
  })
}
