var assert = require('assert');
var uniqueReleaseName = require('../lib/uniqueReleaseName');
describe('Generate Unique Release Name', function () {
  it('Loads', function () {
    assert.ok(uniqueReleaseName);
  });
});
