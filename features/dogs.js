'use strict';
const randomDogBreed = require('dog-breed-names').random;

module.exports = controller => {
  console.log(randomDogBreed());

  controller.hears(['dog?'], ['direct_message', 'direct_mention', 'mention'], async (bot, message) => {
    await bot.reply(message, randomDogBreed());
  });
};
