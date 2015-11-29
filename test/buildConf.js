var test = require('tap').test
var buildConf = require('../bin/buildConf')
var path = require('path')
var fixtures = path.resolve.bind(path, __dirname, 'fixtures')
var fs = require('fs')
var del = require('del')
var build = fixtures('build')
var promisify = require('node-promisify')
var mkdir = promisify(fs.mkdir)
var cwd = process.cwd()

function reset() {
  process.chdir(cwd)
  return del(build)
    .then(function () {
      return mkdir(build)
    })
    .then(function () {
      process.chdir(build)
    })
}

test('default command line conf', function(t) {
  var history = fs.readFileSync(fixtures('format.no.incremental.expected.md'), 'utf8')

  return reset()
    .then(function () {
      return buildConf({}).then(function (conf) {
        t.same(conf, {
          out: 'changelog.md',
          baseUrl: 'https://github.com/zoubin/ezchangelog/commit/',
        }, 'default config')
      })
    })
    .then(reset)
    .then(function () {
      return buildConf({ baseUrl: false })
        .then(function (conf) {
          t.same(conf, {
            baseUrl: false,
            out: 'changelog.md',
          }, 'baseUrl off')
        })
    })
    .then(reset)
    .then(function () {
      var log = 'changelog.markdown'
      fs.writeFileSync(log, history)
      return buildConf({
        baseUrl: false,
        out: log,
      })
      .then(function (conf) {
        t.same(conf, {
          out: log,
          baseUrl: false,
        }, 'incremental off')
      })
    })
    .then(reset)
    .then(function () {
      var log = 'changelog.markdown'
      fs.writeFileSync(log, history)
      return buildConf({
        baseUrl: false,
        out: log,
        incremental: true,
      })
      .then(function (conf) {
        t.same(conf, {
          out: log,
          baseUrl: false,
          history: history,
        }, 'incremental')
      })
    })
    .then(reset)
    .then(function () {
      var log = 'changelog.markdown'
      var pkg = JSON.stringify({
        changelog: { out: log },
      }, null, 2)
      fs.writeFileSync('package.json', pkg)
      fs.writeFileSync(log, history)
      return buildConf({ baseUrl: false }).then(function (conf) {
        t.same(conf, {
          out: log,
          baseUrl: false,
        }, 'package.json')
      })
    })
})
