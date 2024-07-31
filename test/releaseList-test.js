var assert = require('assert');
var releaseList = require('../lib/releaseList');
describe('Release List', function () {
  it('Loads', function () {
    assert.ok(releaseList);
  });
});
