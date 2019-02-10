'use strict';

const semver = require('semver');
const fs = require('mz/fs');

const incrementPackageVersion = async (dir, versionType) => {
  console.log(`Incrementing ${versionType} package version in ${dir}`);
  const filePath = `${dir}/package.json`;
  const json = await fs.readFile(filePath);
  const data = JSON.parse(json);
  const currentVersion = data.version;
  const nextVersion = semver.inc(currentVersion, versionType);
  console.log(`Taking ${filePath} from ${currentVersion} to ${nextVersion}`);

  data.version = nextVersion;
  const string = JSON.stringify(data, null, 2) + '\n';
  await fs.writeFile(filePath, string);
  console.log(`Writing new version to ${filePath}`);

  return {
    currentVersion,
    nextVersion
  };
};

module.exports = incrementPackageVersion;
