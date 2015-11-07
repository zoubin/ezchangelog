#!/usr/bin/env node

var fs = require('fs')
var minimist = require('minimist')
var changeLog = require('..')
var path = require('path')

var argv = minimist(
  process.argv.slice(2),
  {
    string: ['out'],
    boolean: ['print', 'incremental'],
    default: {
      incremental: true,
    },
    alias: {
      p: 'print',
      o: 'out',
      inc: 'incremental',
    },
  }
)

getConfig(argv.out)
.then(function (conf) {
  return readFile(conf.out)
    .then(function (src) {
      conf.source = src
      return conf
    })
})
.then(function (conf) {
  var dest = argv.print
    ? process.stdout
    : fs.createWriteStream(conf.out)
  var formatter = changeLog.format({ history: conf.source })
  if (!argv.incremental) {
    formatter.get('filter').pop()
    formatter.get('wrap').pop()
  } else if (argv.print) {
    formatter.get('wrap').pop()
  }
  process.stdin
    .pipe(changeLog.parse({
      baseUrl: conf.baseUrl,
    }))
    .pipe(formatter)
    .pipe(dest)
})

function readFile(file) {
  return new Promise(function (resolve) {
    fs.readFile(file, 'utf8', function (err, s) {
      resolve(s)
    })
  })
}

function getConfig(out) {
  var noop = function () {}
  return new Promise(function (resolve) {
    resolve(
      require(path.resolve('package.json')).changelog
    )
  })
  .catch(noop)
  .then(function (conf) {
    conf = conf || {}
    if (out) {
      conf.out = out
    }
    conf.out = conf.out || 'changelog.md'
    return conf
  })
}
