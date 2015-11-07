# ezchangelog
Log changes easily.

## Usage

```bash
npm i -g ezchangelog

cd repo

# create a new changelog.md file
ezchangelog

# do some commits

# prepend new changes
ezchangelog

# Print the new changelog contents
git log | ezchangelogStream -p

```

## Example

See [changelog](https://github.com/zoubin/ezchangelog/blob/master/changelog.md)

## ezchangelog

Use it the way you do `git log`,
and your changelog file will be updated.

By default, `--no-merges` is enabled.

## ezchangelogStream
Specify more custom options.

```bash
git log | ezchangelog-stream

```

Pass any valid arguments to `git log`.

Options for `ezchangelog-stream`:

`-p, --print`: print the changelog contents rather than write to disk.

`-o, --out`: specify the changelog file path.

`--inc, --incremental`: used together with `--out` to update changelog incrementally.


## package.json

```json
{
  "ezchangelog": {
    "baseUrl": "https://github.com/zoubin/ezchangelog/commit/",
    "out": "changelog.md"
  }
}
```

There are links to all commits.

`baseUrl`: specify the base path for each commit.
By default, commits are linked to github.

`out`: specify the changelog file path

