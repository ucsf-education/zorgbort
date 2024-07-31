var assert = require('assert');
describe('Github Client', function () {
  it('Fails When GITHUB_TOKEN is missing', function () {
    try {
      const githubClient = require('../lib/github');
    } catch (e) {
      assert.ok(e);
      assert.strictEqual(e.message, 'Error: Specify GITHUB_TOKEN in environment');
    }
  });

  it('Loads', function () {
    process.env.GITHUB_TOKEN = 'test';
    const githubClient = require('../lib/github');
    assert.ok(githubClient);
    delete process.env.GITHUB_TOKEN;
  });
});
