var assert = require('assert');
describe('Run Tag workflow', function () {
  beforeEach(function () {
    process.env.GITHUB_TOKEN = 'test';
  });

  afterEach(function () {
    delete process.env.GITHUB_TOKEN;
  });

  it('Loads', function () {
    const runtagWorkflow = require('../lib/runTagWorkflow');
    assert.ok(runtagWorkflow);
  });
});
