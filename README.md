# ezchangelog
Make it easy to update changelog with commit messages.

[![version](https://img.shields.io/npm/v/ezchangelog.svg)](https://www.npmjs.org/package/ezchangelog)
[![status](https://travis-ci.org/zoubin/ezchangelog.svg?branch=master)](https://travis-ci.org/zoubin/ezchangelog)
[![coverage](https://img.shields.io/coveralls/zoubin/ezchangelog.svg)](https://coveralls.io/github/zoubin/ezchangelog)
[![dependencies](https://david-dm.org/zoubin/ezchangelog.svg)](https://david-dm.org/zoubin/ezchangelog)
[![devDependencies](https://david-dm.org/zoubin/ezchangelog/dev-status.svg)](https://david-dm.org/zoubin/ezchangelog#info=devDependencies)

## Usage

```bash
npm i -g ezchangelog

cd repo

# create a new changelog.md file
changelog

# do some commits

# prepend new changes
changelog

# Print the new changelog contents
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
    "out": "changelog.md"
  }
}
```

There are links to all commits.

`baseUrl`: specify the base path for each commit.
By default, commits are linked to github.

`out`: specify the changelog file path

