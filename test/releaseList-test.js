import assert from 'assert';

describe('Release List', function () {
  beforeEach(function () {
    process.env.GITHUB_TOKEN = 'test';
  });

  afterEach(function () {
    delete process.env.GITHUB_TOKEN;
  });

  it('Loads', async function () {
    const releaseListModule = await import('../lib/releaseList.js');
    assert.ok(releaseListModule);
  });
});
