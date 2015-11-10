var exec = require('child_process').exec

module.exports = function () {
  return new Promise(function (resolve) {
    exec('git tag -l', function (err, lines) {
      var tags = []
      if (lines) {
        tags = lines.split('\n')
          .map(function (s) {
            return s.trim()
          })
          .filter(Boolean)
      }
      resolve(tags)
    })
  })
  .then(function (tags) {
    return tags.map(resolveTagHash)
  })
  .then(Promise.all.bind(Promise))
  .then(function (tags) {
    return tags.reduce(function (o, tag) {
      if (tag.hash) {
        o[tag.hash] = tag.name
      }
      return o
    }, {})
  })
}

function resolveTagHash(tag) {
  return new Promise(function (resolve) {
    exec('git cat-file tag ' + tag, function (err, line) {
      var hash = ''
      if (line) {
        hash = line.trim()
      }
      resolve({ name: tag, hash: hash })
    })
  })
}

