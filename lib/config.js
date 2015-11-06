var path = require('path')

module.exports = function () {
  return require(path.resolve('package.json')).ezchangelog
}
