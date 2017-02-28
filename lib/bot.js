if (!process.env.SLACK_TOKEN) {
  throw new Error('Error: Specify SLACK_TOKEN in environment');
}

const Botkit = require('botkit');
let controller = Botkit.slackbot({
  debug: true,
});
controller.spawn({
  token: process.env.SLACK_TOKEN
}).startRTM();

module.exports = controller;
