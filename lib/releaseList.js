'use strict';

const github = require('./github.js');

exports.releaseList = async (owner, repo) => {
  try {
    return await github.paginate('GET /repos/:owner/:repo/releases', { owner, repo }, (response) =>
      response.data.map((release) => release.name)
    );
  } catch (e) {
    console.error(`error unable to fetch releases: ${e}`);
    return [];
  }
};
