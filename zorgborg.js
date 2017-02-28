require('dotenv').config();
if (!process.env.SLACK_TOKEN) {
    console.log('Error: Specify SLACK_TOKEN in environment');
    process.exit(1);
}

if (!process.env.CLEVER_BOT_USER) {
    console.log('Error: Specify CLEVER_BOT_USER in environment');
    process.exit(1);
}
if (!process.env.CLEVER_BOT_API_KEY) {
    console.log('Error: Specify CLEVER_BOT_API_KEY in environment');
    process.exit(1);
}

var cleverbot = require("cleverbot.io"),
cleverbot = new cleverbot(process.env.CLEVER_BOT_USER, process.env.CLEVER_BOT_API_KEY);
cleverbot.setNick("zorgbort");
cleverbot.create(function (err, session) {
    if (err) {
        console.log('cleverbot create fail.');
    } else {
        console.log('cleverbot create success.');
    }
});

var Botkit = require('botkit');
var os = require('os');

var controller = Botkit.slackbot({
    debug: true,
});

var bot = controller.spawn({
    token: process.env.SLACK_TOKEN
}).startRTM();

controller.hears('','direct_message,direct_mention,mention',function(bot,message) {
    var msg = message.text;
    cleverbot.ask(msg, function (err, response) {
        if (!err) {
            bot.reply(message, response);
        } else {
            console.log('cleverbot err: ' + err);
        }
    });
});
