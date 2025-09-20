'use strict';

const github = require('./github.js');

exports.releaseLatest = async (owner, repo) => {
  try {
    return await github.request('GET /repos/:owner/:repo/releases/latest', {
      owner,
      repo,
    });
  } catch (e) {
    console.error(`error unable to fetch latest release: ${e}`);
    return [];
  }
};
