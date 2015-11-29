var promisify = require('node-promisify')
var exec = promisify(require('child_process').exec)
module.exports = function (cmd) {
  return exec(cmd).catch(function () {
    return ''
  })
}

