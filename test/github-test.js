var assert = require('assert');
var githubClient = require('../lib/github');
describe('Github Client', function () {
  it('Loads', function () {
    assert.ok(githubClient);
  });
});
