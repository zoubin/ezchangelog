var exec = require('./exec')

module.exports = function () {
  return exec('git ls-remote --get-url origin')
    .then(function (line) {
      return line && line.split(':')[1].trim().slice(0, -4)
    })
    .then(function (repo) {
      return repo && 'https://github.com/' + repo + '/commit/'
    })
}

