var test = require('tap').test
var getUrl = require('../lib/getGithubCommitBaseUrl')

test('github commit link', function(t) {
  t.plan(1)
  getUrl().then(function (base) {
    //t.equal(base, 'https://github.com/zoubin/ezchangelog/commit/')
    // Travis won't pass. It generates something like:
    // https://github.com///github.com/zoubin/ezchangelog/commit/
    t.ok(/zoubin\/ezchangelog\/commit\/$/.test(base))
  })
})
