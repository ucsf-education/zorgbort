'use strict';
const cheeseName = require('cheese-name');

module.exports = bot => {
  bot.hears(['cheese?'], 'direct_message,direct_mention,mention', async (bot, message) => {
    await bot.reply(message, cheeseName());
  });
};
