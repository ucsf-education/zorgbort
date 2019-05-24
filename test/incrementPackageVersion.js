'use strict';

const incrementPackageVersion = require('../lib/incrementPackageVersion');
const assert = require('assert');
const fs = require('mz/fs');
const mkdirp = require('mkdirp');
const appRoot = require('app-root-path');

describe('Increment Package Version', function() {
  const tmpDir = `${appRoot}/tmp`;
  const packagePath = `${tmpDir}/package.json`;
  const lockPath = `${tmpDir}/package-lock.json`;

  const getVersionData = async function(){
    const packageJson = await fs.readFile(packagePath);
    const packageData = JSON.parse(packageJson);

    const lockJson = await fs.readFile(packagePath);
    const lockData = JSON.parse(lockJson);

    return {
      packageVersion: packageData.version,
      lockVersion: lockData.version,
    };
  };

  before('create temporary directory', async function(){
    const exists = await fs.exists(tmpDir);
    if (!exists) {
      await mkdirp(tmpDir);
    }
  }),

  beforeEach('create files', async function() {
    await fs.writeFile(packagePath, JSON.stringify({
      version: '1.0.0'
    }));
    await fs.writeFile(lockPath, JSON.stringify({
      version: '1.0.0'
    }));
  });
  afterEach('remove files', async function() {
    await fs.unlink(packagePath);
    await fs.unlink(lockPath);
  });
  it('Increments Major', async function() {
    const { currentVersion, nextVersion } = await incrementPackageVersion(tmpDir, 'major');
    const targetVersion = '2.0.0';
    assert.equal(currentVersion, '1.0.0');
    assert.equal(nextVersion, targetVersion);

    const { packageVersion, lockVersion } = await getVersionData();
    assert.equal(packageVersion, targetVersion);
    assert.equal(lockVersion, targetVersion);
  });
  it('Increments Minor', async function() {
    const { currentVersion, nextVersion } = await incrementPackageVersion(tmpDir, 'minor');
    const targetVersion = '1.1.0';
    assert.equal(currentVersion, '1.0.0');
    assert.equal(nextVersion, targetVersion);

    const { packageVersion, lockVersion } = await getVersionData();
    assert.equal(packageVersion, targetVersion);
    assert.equal(lockVersion, targetVersion);
  });
  it('Increments Patch', async function() {
    const { currentVersion, nextVersion } = await incrementPackageVersion(tmpDir, 'patch');
    const targetVersion = '1.0.1';
    assert.equal(currentVersion, '1.0.0');
    assert.equal(nextVersion, targetVersion);

    const { packageVersion, lockVersion } = await getVersionData();
    assert.equal(packageVersion, targetVersion);
    assert.equal(lockVersion, targetVersion);
  });
});
