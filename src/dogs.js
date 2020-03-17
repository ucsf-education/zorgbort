'use strict';
const randomDogBreed = require('dog-breed-names').random;

module.exports = bot => {
  bot.hears(['dog?'], 'direct_message,direct_mention,mention', async (bot, message) => {
    await bot.reply(message, randomDogBreed());
  });
};
