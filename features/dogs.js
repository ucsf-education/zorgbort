'use strict';
const randomDogBreed = require('dog-breed-names').random;

module.exports = controller => {
  controller.hears(['dog?'], ['direct_message', 'direct_mention', 'mention'], (bot, message) => {
    bot.reply(message, randomDogBreed());
  });
};
