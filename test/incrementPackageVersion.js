'use strict';

const incrementPackageVersion = require('../lib/incrementPackageVersion');
const assert = require('assert');
const fs = require('mz/fs');
const mkdirp = require('mkdirp');
const appRoot = require('app-root-path');

describe('Increment Package Version', function() {
  const tmpDir = `${appRoot}/tmp`;
  const filePath = `${tmpDir}/package.json`;

  before('create temporary directory', async function(){
    const exists = await fs.exists(tmpDir);
    if (!exists) {
      await mkdirp(tmpDir);
    }
  }),

  beforeEach('create package.json file', async function() {
    await fs.writeFile(filePath, JSON.stringify({
      version: '1.0.0'
    }));
  });
  afterEach('remove package.json file', async function() {
    await fs.unlink(filePath);
  });
  it('Increments Major', async function() {
    const result = await incrementPackageVersion(tmpDir, 'major');
    const targetVersion = '2.0.0';
    assert.equal(result, targetVersion);
    const json = await fs.readFile(filePath);
    const data = JSON.parse(json);
    assert.equal(data.version, targetVersion);
  });
  it('Increments Minor', async function() {
    const result = await incrementPackageVersion(tmpDir, 'minor');
    const targetVersion = '1.1.0';
    assert.equal(result, targetVersion);
    const json = await fs.readFile(filePath);
    const data = JSON.parse(json);
    assert.equal(data.version, targetVersion);
  });
  it('Increments Patch', async function() {
    const result = await incrementPackageVersion(tmpDir, 'patch');
    const targetVersion = '1.0.1';
    assert.equal(result, targetVersion);
    const json = await fs.readFile(filePath);
    const data = JSON.parse(json);
    assert.equal(data.version, targetVersion);
  });
});
