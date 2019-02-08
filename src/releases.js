'use strict';
const github = require('../lib/github.js');

const releaseList = async (owner, repo) => {
  try {
    return await github.paginate(
      'GET /repos/:owner/:repo/releases',
      { owner, repo },
      response => response.data.map(release => release.name));
  } catch (e) {
    console.error(`error unable to fetch releases: ${e}`);
    return [];
  }
};

const listFrontendReleases = async (bot, message) => {
  const releases = await releaseList('ilios', 'frontend');
  bot.reply(message, releases.join(', '));
};

module.exports = bot => {
  bot.hears('frontend releases', 'direct_message,direct_mention,mention', listFrontendReleases);
};
