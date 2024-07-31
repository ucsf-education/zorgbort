var assert = require('assert');

describe('Generate Unique Release Name', function () {
  beforeEach(function () {
    process.env.GITHUB_TOKEN = 'test';
  });

  afterEach(function () {
    delete process.env.GITHUB_TOKEN;
  });

  it('Loads', function () {
    const uniqueReleaseName = require('../lib/uniqueReleaseName');
    assert.ok(uniqueReleaseName);
  });
});
