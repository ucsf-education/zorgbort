'use strict';
const randomName = require('dog-breed-names').random;

const randomDogbreed = async (bot, message) => {
  await bot.reply(message, randomName());
};

module.exports = randomDogbreed;
