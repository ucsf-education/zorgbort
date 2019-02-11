'use strict';
const uniqueReleaseName = require('../lib/uniqueReleaseName');
const assert = require('assert');

describe('Unique Release Name', function() {
  const MockReleaseList = (owner, repo) => {
    assert.equal(owner, 'testowner');
    assert.equal(repo, 'testrepo');
    return ['first release', 'second release'];
  };
  it('Works', async function() {
    const MockNamer = version => {
      return `test ${version}`;
    };
    const result = await uniqueReleaseName('v1.3', MockReleaseList, MockNamer, 'testowner', 'testrepo');
    assert.equal(result, 'test v1.3');
  });
  it('Iterates when names match', async function() {
    let count = 0;
    const MockNamer = () => {
      count++;
      if (1 === count) {
        return 'first release';
      }
      if (2 === count) {
        return 'second release';
      }
      if (3 === count) {
        return 'test';
      }
    };
    const result = await uniqueReleaseName('v1.3', MockReleaseList, MockNamer, 'testowner', 'testrepo');
    assert.equal(result, 'test');
    assert.equal(count, 3);
  });
  it('Gives up eventually', async function() {
    let count = 0;
    const MockNamer = () => {
      count++;
      return 'first';
    };
    try {
      await uniqueReleaseName('v1.3', MockReleaseList, MockNamer, 'testowner', 'testrepo');
    } catch (e) {
      assert.ok(e.message.includes('Tried'));
      assert.ok(e.message.includes('imes to get a unique release but failed.'));
      assert.ok(e.message.includes('Old Release Names: first release,second release'));
      assert.ok(e.message.includes('Attempted Release Names: first, first'));
      assert.ok(count > 20, 'Tried enough times');
    }
  });
});
