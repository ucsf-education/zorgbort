require('dotenv').config();
if (!process.env.SLACK_TOKEN) {
  throw new Error('Error: Specify SLACK_TOKEN in environment');
}
if (!process.env.CLEVER_BOT_USER) {
  throw new Error('Error: Specify CLEVER_BOT_USER in environment');
}
if (!process.env.CLEVER_BOT_API_KEY) {
  throw new Error('Error: Specify CLEVER_BOT_API_KEY in environment');
}

const Cleverbot = require("cleverbot.io");
let cleverbot = new Cleverbot(process.env.CLEVER_BOT_USER, process.env.CLEVER_BOT_API_KEY);
cleverbot.setNick("zorgbort");
cleverbot.create(err => {
  console.error(`cleverbot error: ${err}`);
});

const Botkit = require('botkit');
let controller = Botkit.slackbot({
  debug: true,
});
controller.spawn({
  token: process.env.SLACK_TOKEN
}).startRTM();

controller.hears('','direct_message,direct_mention,mention',function(bot,message) {
  let msg = message.text;
  cleverbot.ask(msg, function (err, response) {
    if (!err) {
      bot.reply(message, response);
    } else {
      console.error(`cleverbot error: ${err}`);
    }
  });
});
