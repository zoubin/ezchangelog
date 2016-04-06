#!/usr/bin/env node

var spawn = require('child_process').spawn
var fs = require('fs')
var changelog = require('..')

var Command = require('commander').Command
var program = new Command('changelog')

var plugins = []

program
  .version(require('../package.json').version)
  .usage('[options] OR git log [git_log_options] | changelog [options]')
  .option('-o, --out <file>', 'The changelog file path. You can also specify it in the package.json `changelog.out` field.')
  .option('-P, --print', 'Just print the contents, no disk writing.')
  .option('-p, --plugin <name>', 'Plugin to apply')
  .on('plugin', function (v) {
    plugins.push(v)
  })
  .option('-I, --no-incremental', 'Overwrite the original changelog instead of prepending new changes.')
  .option('-c, --base-url <baseUrl>', 'The baseUrl of commit links')
  .parse(process.argv)

require('./buildConf')(program).then(function (conf) {
  var stdin = process.stdin
  if (process.stdin.isTTY) {
    stdin = spawn('git', ['log', '--no-merges']).stdout
  }
  var stdout = process.stdout
  if (conf.out && stdout.isTTY && !program.print) {
    stdout = fs.createWriteStream(conf.out)
  }

  plugins = plugins.concat(conf.plugin)
  if (program.incremental) {
    plugins.push([require('../lib/incrementalize'), { history: conf.history }])
  }

  stdin.pipe(changelog({
    baseUrl: conf.baseUrl,
    plugin: plugins,
  })).pipe(stdout)
})
.catch(function (err) {
  console.log(err)
})

