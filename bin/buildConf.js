var promisify = require('node-promisify')
var fs = require('fs')
var path = require('path')
var readFile = promisify(fs.readFile)
var getGithubCommitBaseUrl = require('../lib/getGithubCommitBaseUrl')
var pick = require('util-mix/pick')

module.exports = function (opts) {
  return Promise.resolve()
    .then(function () {
      return require(path.resolve('package.json')).changelog || {}
    })
    .catch(function () {
      return {}
    })
    .then(function (conf) {
      return pick(
        ['out', 'baseUrl'],
        { out: 'changelog.md' },
        conf, opts
      )
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
