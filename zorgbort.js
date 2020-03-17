'use strict';
require('dotenv').config();

const bot = require('./lib/bot.js');

bot.ready(() => {
  bot.loadModule(__dirname + '/src/releases');
  bot.loadModule(__dirname + '/src/releaseAndTag');
  bot.loadModule(__dirname + '/src/cheese');
  bot.loadModule(__dirname + '/src/dogs');
  bot.loadModule(__dirname + '/src/conversation');
});
