'use strict';
const randomCheese = require('../src/cheese');
const randomDogbreed = require('../src/dogs');
const { defaultExcuse, hi, listUsers, uptime }  = require('../src/conversation');
const { listReleases, releaseInteraction } = require('../src/releases');

const mention = ['direct_message', 'direct_mention', 'mention'];

module.exports = controller => {
  controller.on('block_actions', releaseInteraction);
  controller.hears(['hello', 'hi', 'howdy', 'sup', 'howzit'], mention, hi);
  controller.hears(['uptime', 'identify yourself', 'who are you', 'what is your name'], mention, uptime);
  controller.hears(['list users'], mention, listUsers);
  controller.hears(['cheese?'], mention, randomCheese);
  controller.hears(['dog?'], mention, randomDogbreed);
  controller.hears('list releases', mention, listReleases);
  controller.hears('', mention, defaultExcuse);
};
