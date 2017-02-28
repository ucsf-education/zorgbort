require('dotenv').config();
const releases = require('./src/releases.js');

const bot = require('./lib/bot.js');
const excuse = require('huh');

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
  let reason = excuse.get('en');
  bot.reply(message, `Sorry, I don't know how to _${msg}_. It must be *${reason}!*`);
});
