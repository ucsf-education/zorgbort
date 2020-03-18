'use strict';
const cheeseName = require('cheese-name');

module.exports = controller => {
  controller.hears(['cheese?'], ['direct_message', 'direct_mention', 'mention'], async (bot, message) => {
    await bot.reply(message, cheeseName());
  });
};
