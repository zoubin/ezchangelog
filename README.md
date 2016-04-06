# ezchangelog
[![version](https://img.shields.io/npm/v/ezchangelog.svg)](https://www.npmjs.org/package/ezchangelog)
[![status](https://travis-ci.org/zoubin/ezchangelog.svg?branch=master)](https://travis-ci.org/zoubin/ezchangelog)
[![coverage](https://img.shields.io/coveralls/zoubin/ezchangelog.svg)](https://coveralls.io/github/zoubin/ezchangelog)
[![dependencies](https://david-dm.org/zoubin/ezchangelog.svg)](https://david-dm.org/zoubin/ezchangelog)
[![devDependencies](https://david-dm.org/zoubin/ezchangelog/dev-status.svg)](https://david-dm.org/zoubin/ezchangelog#info=devDependencies)

Make it easy to update changelog with commit messages.

## Usage

```bash
npm i -g ezchangelog

cd repo

# create a new changelog.md file
changelog

# do some commits

# prepend new changes use `git log --no-merges`
changelog

# prepend new changes
git log --before Nov.10 | changelog

```

## Example

See [changelog](https://github.com/zoubin/ezchangelog/blob/master/changelog.md)

## Command line

`changelog -h` to see options.

There are two ways in the command line.

The following command will call `git log --no-merges` to generate changes info:

```bash
changelog [options]

```

You can also pipe the changes into it:

```bash
git log --before Nov.10 | changelog [options]

```

### package.json

```json
{
  "changelog": {
    "baseUrl": "https://github.com/zoubin/ezchangelog/commit/",
    "plugin": ["pluginName"],
    "out": "changelog.md"
  }
}
```

There are links to all commits.

`baseUrl`: specify the base path for each commit.
By default, commits are linked to github.

`out`: specify the changelog file path

## API

```js
var changelog = require('ezchangelog')

```

### changelog(opts)
Return a transform to process `git log` outputs.

**opts.baseUrl**

Specify the url base for commits.

Type: `String`

**opts.plugin**

Specify extra plugins to apply to the pipeline.

Type: `Array`

Each element should be an `Array`,
if the plugin should take an extra argument besides the `Changelog` instance.

```js
{
  plugin: [ [function pluginFn(instance, opt) {}, opt] ]
}

```

### changelog.Changelog
The constructor for loggers.

You can process the `pipeline` property and the `plugin` function.

**pipeline**

A duplex created by [labeled-stream-splicer],
assembling a group of transforms to process the log.

There are two main phases:
* parse: containing sub-phases: split, commit, tag, url. The main purpose of this phase is to create commit objects.
* format: containing one sub-phase: markdownify. Commit objects are formatted to markdown in this phase.

You can manipulate the `pipeline` in the way [labeled-stream-splicer] supports.

**plugin**

Type: `Array`

Each element is a plugin with optional argument.

A plugin is used to manipulate the `pipeline` property:

```js
var Changelog = require('ezchangelog').Changelog
var c = new Changelog()
c.plugin(fn)

source.pipe(c.pipeline).pipe(dest)

funciton fn(c, opts) {
  // parse emails
  c.pipeline.get('parse').push(emailParser)

  // replace the default formatter with a custom one
  c.pipeline.get('format').splice('markdownify', 1, myOwesomeFormatter)
}

```

