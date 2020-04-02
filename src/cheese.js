'use strict';
const cheeseName = require('cheese-name');

const randomCheese = async (bot, message) => {
  await bot.reply(message, cheeseName());
};

module.exports = randomCheese;
