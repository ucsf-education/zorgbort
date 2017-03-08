'use strict';
const cheeseName = require('cheese-name');

module.exports = bot => {
  bot.hears(['cheese?'], 'direct_message,direct_mention,mention', (bot, message) => {
    bot.reply(message, cheeseName());
  });
};
