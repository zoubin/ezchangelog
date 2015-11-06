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
git log | ezchangelog-stream -p

```

## Example

See [changelog](changelog.md)

## ezchangelog

Use it the way you do `git log`,
and your changelog file will be updated.

By default, `--no-merges` is enabled.

## ezchangelog-stream
Specify more custom options.

```bash
git log | ezchangelog-stream

```

Pass any valid arguments to `git log`.

Options for `ezchangelog-stream`:

`p, --print`: print the changelog contents rather than write to disk.

`f, --file`: specify the changelog file path.

## package.json

```json
{
  "ezchangelog": {
    "commits": "https://github.com/zoubin/ezchangelog/commit/",
    "changelog": "changelog.md"
  }
}
```

There are links to all commits.

`commits`: specify the base path for each commit.
By default, commits are linked to github.

`changelog`: specify you changelog file path

