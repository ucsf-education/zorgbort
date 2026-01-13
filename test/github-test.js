import assert from 'assert';

// ES modules cache imports, so we need unique URLs to re-import with different env vars
const importGithub = () => import(`../lib/github.js?t=${Date.now()}`);

describe('Github Client', function () {
  it('Fails When GITHUB_TOKEN is missing', async function () {
    try {
      await importGithub();
    } catch (e) {
      assert.ok(e);
      assert.strictEqual(e.message, 'Error: Specify GITHUB_TOKEN in environment');
    }
  });

  it('Loads', async function () {
    process.env.GITHUB_TOKEN = 'test';
    const { default: githubClient } = await importGithub();
    assert.ok(githubClient);
    delete process.env.GITHUB_TOKEN;
  });
});
