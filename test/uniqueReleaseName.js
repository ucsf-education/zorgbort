import assert from 'assert';

describe('Generate Unique Release Name', function () {
  beforeEach(function () {
    process.env.GITHUB_TOKEN = 'test';
  });

  afterEach(function () {
    delete process.env.GITHUB_TOKEN;
  });

  it('Loads', async function () {
    const { default: uniqueReleaseName } = await import('../lib/uniqueReleaseName.js');
    assert.ok(uniqueReleaseName);
  });
});
