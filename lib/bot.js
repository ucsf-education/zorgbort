'use strict';
if (!process.env.SLACK_TOKEN) {
  throw new Error('Error: Specify SLACK_TOKEN in environment');
}
if (!process.env.SLACK_CLIENT_ID) {
  throw new Error('Error: Specify SLACK_CLIENT_ID in environment');
}
if (!process.env.SLACK_CLIENT_SECRET) {
  throw new Error('Error: Specify SLACK_CLIENT_SECRET in environment');
}
if (!process.env.SLACK_SIGNING_SECRET) {
  throw new Error('Error: Specify SLACK_SIGNING_SECRET in environment');
}

const Botkit = require('botkit');

const options = {
  clientId: process.env.SLACK_CLIENT_ID,
  clientSecret: process.env.SLACK_CLIENT_SECRET,
  clientSigningSecret: process.env.SLACK_SIGNING_SECRET,
  debug: false,
  scopes: ['bot'],
};

const controller = Botkit.slackbot(options);
controller.spawn({
  token: process.env.SLACK_TOKEN
}).startRTM();

module.exports = controller;
