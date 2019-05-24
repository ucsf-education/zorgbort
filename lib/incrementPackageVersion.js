'use strict';

const semver = require('semver');
const fs = require('mz/fs');

const incrementPackageVersion = async (dir, versionType) => {
  console.log(`Incrementing ${versionType} package version in ${dir}`);
  const packagePath = `${dir}/package.json`;
  const { currentVersion, nextVersion } = await getVersionData(packagePath, versionType);
  console.log(`Taking ${packagePath} from ${currentVersion} to ${nextVersion}`);
  await writeFile(packagePath, nextVersion);

  const lockPath = `${dir}/package-lock.json`;
  console.log(`Taking ${lockPath} from ${currentVersion} to ${nextVersion}`);
  await writeFile(lockPath, nextVersion);

  return {
    currentVersion,
    nextVersion
  };
};

const getVersionData = async (filePath, versionType) => {
  const json = await fs.readFile(filePath);
  const data = JSON.parse(json);
  const currentVersion = data.version;
  const nextVersion = semver.inc(currentVersion, versionType);

  return {
    currentVersion,
    nextVersion
  };
};

const writeFile = async (filePath, nextVersion) => {
  const json = await fs.readFile(filePath);
  const data = JSON.parse(json);

  data.version = nextVersion;
  const string = JSON.stringify(data, null, 2) + '\n';
  await fs.writeFile(filePath, string);
  console.log(`Writing new version to ${filePath}`);
};

module.exports = incrementPackageVersion;
