'use strict';

const { releaseList } = require('../lib/releaseList');

const listFrontendReleases = async (bot, message) => {
  const releases = await releaseList('ilios', 'frontend');
  bot.reply(message, releases.join(', '));
};

const listCommonReleases = async (bot, message) => {
  const releases = await releaseList('ilios', 'common');
  bot.reply(message, releases.join(', '));
};

module.exports = bot => {
  bot.hears('frontend releases', 'direct_message,direct_mention,mention', listFrontendReleases);
  bot.hears('common releases', 'direct_message,direct_mention,mention', listCommonReleases);
};
