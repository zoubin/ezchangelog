var split = require('split2')
var splicer = require('labeled-stream-splicer')
var parser = require('./parser')

module.exports = function (opts) {
  return splicer.obj([
    'split', [ split() ],
    'commit', [ parser.commit() ],
    'tag', [ parser.tag() ],
    'url', [ parser.url(opts) ],
  ])
}

