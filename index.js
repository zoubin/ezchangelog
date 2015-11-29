var combine = require('stream-combiner2')
var parse = require('./lib/parse')
var format = require('./lib/format')

exports = module.exports = function (opts) {
  return combine.obj(parse(opts), format(opts))
}
exports.format = format
exports.parse = parse
exports.formatter = require('./lib/formatter')
exports.parser = require('./lib/parser')

