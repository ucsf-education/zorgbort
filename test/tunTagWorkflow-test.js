import assert from 'assert';

describe('Run Tag workflow', function () {
  beforeEach(function () {
    process.env.GITHUB_TOKEN = 'test';
  });

  afterEach(function () {
    delete process.env.GITHUB_TOKEN;
  });

  it('Loads', async function () {
    const runtagWorkflow = await import('../lib/runTagWorkflow.js');
    assert.ok(runtagWorkflow);
  });
});
