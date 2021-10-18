'use strict';

const uniqueReleaseName = async (version, releaseList, namer, owner, repo) => {
  console.log(`Finding a new release name for ${owner}/${repo}`);
  const names = await releaseList(owner, repo);
  let releaseName = namer(version);
  const attemptedNames = [releaseName];
  let tries = 0;
  while (names.includes(releaseName)) {
    tries++;
    releaseName = namer();
    attemptedNames.push(releaseName);
    if (tries > 20) {
      const triedNames = attemptedNames.join(', ');
      const existingNames = names.join(', ');
      throw new Error(`Tried ${tries} times to get a unique release but failed.
        Old Release Names: ${existingNames}
        Attempted Release Names: ${triedNames}
        `);
    }
  }
  console.log(`Release name "${releaseName}" has been generated.`);

  return releaseName;
};

module.exports = uniqueReleaseName;
