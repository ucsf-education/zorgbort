var assert = require('assert');

describe('Release List', function () {
  beforeEach(function () {
    process.env.GITHUB_TOKEN = 'test';
  });

  afterEach(function () {
    delete process.env.GITHUB_TOKEN;
  });

  it('Loads', function () {
    const releaseList = require('../lib/releaseList');
    assert.ok(releaseList);
  });
});
