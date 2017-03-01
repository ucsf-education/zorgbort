'use strict';
const github = require('../lib/github.js');
const RSVP = require('rsvp');

const { Promise } = RSVP;

const releaseList = repo => {
  return new Promise(resolve => {
    github.repos.getReleases({
      owner: 'ilios',
      repo
    }).then(response => {
      const names = response.data.map(obj => obj.name);
      resolve(names);
    }).catch(err => {
      console.error(`error: ${err}`);
    });
  });

};

const listFrontendReleases = (bot, message) => {
  releaseList('frontend').then(response => {
    bot.reply(message, response.join(', '));
  });
};

module.exports = bot => {
  bot.hears('frontend releases','direct_message,direct_mention,mention', listFrontendReleases);
};
