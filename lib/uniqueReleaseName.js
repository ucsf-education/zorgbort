'use strict';

const uniqueReleaseName = async (Github, namer, owner, repo) => {
  const releases = await Github.repos.getReleases({
    owner,
    repo
  });
  const names = releases.data.map(obj => obj.name);
  const searchString = names.join();
  let releaseName = namer();
  const attemptedNames = [releaseName];
  let tries = 0;
  while (searchString.includes(releaseName)) {
    tries++;
    releaseName = namer();
    attemptedNames.push(releaseName);
    if (tries > 20) {
      const triedNames = attemptedNames.join(', ');
      throw new Error(`Tried ${tries} times to get a unique release but failed.
        Old Release Names: ${searchString}
        Attempted Release Names: ${triedNames}
        `);
    }
  }

  return releaseName;
};

module.exports = uniqueReleaseName;
