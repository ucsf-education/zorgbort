'use strict';

const semver = require('semver');
const fs = require('mz/fs');

const incrementPackageVersion = async (dir, versionType) => {
  const filePath = `${dir}/package.json`;
  const json = await fs.readFile(filePath);
  const data = JSON.parse(json);
  const currentVersion = data.version;
  const nextVersion = semver.inc(currentVersion, versionType);

  data.version = nextVersion;
  const string = JSON.stringify(data, null, 2) + '\n';
  await fs.writeFile(filePath, string);

  return nextVersion;
};

module.exports = incrementPackageVersion;
