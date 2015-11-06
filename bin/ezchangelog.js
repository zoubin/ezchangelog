#!/usr/bin/env node

var fs = require('fs')
var thr = require('through2')
var parser = require('git-log-parser')
var exec = require('child_process').exec

var argv = require('minimist')(process.argv.slice(2), {
  string: ['file', 'before', 'after'],
  boolean: ['print'],
  alias: {
    p: 'print',
    f: 'file',
    b: 'before',
    a: 'after',
  },
})

var changelog = argv.file || 'changelog.md'
var pushed = false
var lastCommit = getLastCommit(changelog)
var tagList = getTagList().then(function (hashes) {
  return hashes.reduce(function (o, hash) {
    o[hash.hash] = hash.tag
    return o
  }, {})
})

lastCommit.then(function (hash) {
  return readFile(changelog).then(function (log) {
    var dest = argv.print ? process.stdout : fs.createWriteStream(changelog)
    parser.parse()
      .pipe(filter(hash))
      .pipe(toMarkdown())
      .pipe(append(log))
      .pipe(dest)
  })
})

function append(log) {
  if (!log) {
    return thr()
  }
  return thr(function (buf, _, next) {
    next(null, buf)
  }, function (done) {
    var self = this
    lastCommit.then(function (hash) {
      if (hash && pushed) {
        self.push(log.slice(log.indexOf('\n\n') + 2))
      } else {
        self.push(log)
      }
      done()
    })
  })
}

function readFile(file) {
  return new Promise(function (resolve) {
    fs.readFile(file, 'utf8', function (err, body) {
      resolve(body)
    })
  })
}

function getLastCommit(file) {
  return new Promise(function (resolve) {
    exec('head -n 1 ' + file, function (err, line) {
      var hash = ''
      var header = '<!-- LATEST '
      if (line && line.indexOf(header) === 0) {
        hash = line.substring(header.length, header.length + 7)
      }
      resolve(hash.slice(0, 7))
    })
  })
}

function getTagList() {
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
}

function resolveTagHash(tag) {
  return new Promise(function (resolve) {
    exec('git show-ref --dereference ' + tag + ' | tail -n1 | awk \'{print $1}\'', function (err, line) {
      var hash = ''
      if (line) {
        hash = line.trim()
      }
      resolve({ tag: tag, hash: hash.slice(0, 7) })
    })
  })
}

function getRepo() {
  return new Promise(function (resolve) {
    exec('git remote -v | head -n1', function (err, line) {
      var repo = ''
      if (line) {
        repo = line.split(/\s+/)[1]
        repo = repo.slice(repo.indexOf(':') + 1, -4)
      }
      resolve(repo)
    })
  })
}

function filter(last) {
  if (!last) {
    return thr.obj()
  }
  return thr.obj(function (ci, _, next) {
    if (last === ci.commit.short) {
      return this.push(null)
    }
    next(null, ci)
  })
}

function toMarkdown() {
  var repo = getRepo()

  function tagMD(ci, tag) {
    return wrapLink(tag, ci.commit.short).then(function (link) {
      return '## ' + link + ' (' + ci.committer.date.toISOString().slice(0, 10) + ')' + '\n\n'
    })
  }

  function ciMD(ci) {
    return wrapLink(ci.commit.short, ci.commit.short).then(function (link) {
      return '* [ ' + link + ' ] ' +
        ci.subject + '\n\n' +
        (ci.body ? ci.body.replace(/\n/g, '\n\n') : '')
    })
  }

  function wrapLink(text, hash) {
    return repo.then(function (r) {
      if (!r) {
        return text
      }
      return '[' + text + '](https://github.com/' + r + '/commit/' + hash + ')'
    })
  }

  function format(ci, tag) {
    if (tag) {
      return tagMD(ci, tag)
    }
    return ciMD(ci)
  }

  return thr.obj(function (ci, _, next) {
    var self = this
    tagList.then(function (hashes) {
      if (!pushed) {
        self.push('<!-- LATEST ' + ci.commit.short + ' -->\n\n')
        pushed = true
      }
      format(ci, hashes[ci.commit.short]).then(function (text) {
        next(null, text)
      })
    })
  })
}

