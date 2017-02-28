require('dotenv').config();
const releases = require('./src/releases.js');

const bot = require('./lib/bot.js');
const cleverbot = require('./lib/cleverbot.js');
bot.hears('list frontend releases','direct_message,direct_mention,mention',function(bot,message) {
  releases.list((err, response) => {
    if (!err) {
      bot.reply(message, response.join(', '));
    } else {
      console.error(`cleverbot error: ${err}`);
    }
  });
});


bot.hears('','direct_message,direct_mention,mention',function(bot,message) {
  let msg = message.text;
  cleverbot.ask(msg, function (err, response) {
    if (!err) {
      bot.reply(message, response);
    } else {
      console.error(`cleverbot error: ${err}`);
    }
  });
});
