var test = require('tap').test
var getUrl = require('../lib/getGithubCommitBaseUrl')

test('github commit link', function(t) {
  t.plan(1)
  getUrl().then(function (base) {
    t.equal(base, 'https://github.com/zoubin/ezchangelog/commit/')
  })
})
