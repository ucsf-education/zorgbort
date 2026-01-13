import assert from 'assert';

describe('Github Client', function () {
  it('Fails When GITHUB_TOKEN is missing', async function () {
    try {
      await import('../lib/github.js');
    } catch (e) {
      assert.ok(e);
      assert.strictEqual(e.message, 'Error: Specify GITHUB_TOKEN in environment');
    }
  });

  it('Loads', async function () {
    process.env.GITHUB_TOKEN = 'test';
    const { default: githubClient } = await import('../lib/github.js');
    assert.ok(githubClient);
    delete process.env.GITHUB_TOKEN;
  });
});
