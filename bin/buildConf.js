var exec = require('../lib/exec')
var promisify = require('node-promisify')
var fs = require('fs')
var path = require('path')
var readFile = promisify(fs.readFile)

module.exports = function (opts) {
  return Promise.resolve()
    .then(function () {
      return require(path.resolve('package.json')).changelog || {}
    })
    .catch(function () {
      return {}
    })
    .then(function (conf) {
      var o = {}
      o.out = opts.out || conf.out || 'changelog.md'
      o.baseUrl = opts.baseUrl == null
        ? conf.baseUrl
        : opts.baseUrl
      if (conf.plugin != null) {
        o.plugin = conf.plugin
      }
      return o
    })
    .then(function (conf) {
      if (conf.out && opts.incremental) {
        return readFile(conf.out, 'utf8')
          .then(function (src) {
            conf.history = src
            return conf
          })
          .catch(function () {
            return conf
          })
      }
      return conf
    })
    .then(function (conf) {
      if (!conf.baseUrl && conf.baseUrl !== false) {
        return getGithubCommitBaseUrl().then(function (base) {
          conf.baseUrl = base
          return conf
        })
      }
      return conf
    })
}

function getGithubCommitBaseUrl() {
  return exec('git ls-remote --get-url origin')
    .then(function (line) {
      return line && line.split(':')[1].trim().slice(0, -4)
    })
    .then(function (repo) {
      return repo && 'https://github.com/' + repo + '/commit/'
    })
}
