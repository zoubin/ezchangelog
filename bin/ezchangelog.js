#!/usr/bin/env node

var fs = require('fs')
var argv = require('minimist')(process.argv.slice(2), {
  string: ['changelog'],
  boolean: ['print', 'help'],
  alias: {
    h: 'help',
    p: 'print',
    f: 'changelog',
  },
})

var changelog = argv.changelog || 'changelog.md'

var contents
try {
  contents = fs.readFileSync(changelog, 'utf8')
} catch (e) {
}

var dest = argv.print ? process.stdout : fs.createWriteStream(changelog)

process.stdin
  .pipe(require('../lib/parser')())
  .pipe(require('../lib/formatter')(contents))
  .pipe(dest)
