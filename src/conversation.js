const excuse = require('huh');

const defaultExcuse = (bot, message) => {
  let msg = message.text;
  let reason = excuse.get('en');
  bot.reply(message, `Sorry, I don't know how to _${msg}_. It must be *${reason}!*`);
};

module.exports = bot => {
  bot.hears('','direct_message,direct_mention,mention', defaultExcuse);
};
