'use strict';
if (!process.env.SLACK_CLIENT_ID) {
  throw new Error('Error: Specify SLACK_CLIENT_ID in environment');
}
if (!process.env.SLACK_CLIENT_SECRET) {
  throw new Error('Error: Specify SLACK_CLIENT_SECRET in environment');
}
if (!process.env.SLACK_SIGNING_SECRET) {
  throw new Error('Error: Specify SLACK_SIGNING_SECRET in environment');
}
if (!process.env.SLACK_OAUTH_TOKEN) {
  throw new Error('Error: Specify SLACK_OAUTH_TOKEN in environment');
}
if (!process.env.SLACK_OAUTH_BOT_USER_TOKEN) {
  throw new Error('Error: Specify SLACK_OAUTH_BOT_USER_TOKEN in environment');
}
// const PORT = process.env.PORT || 80;

const { Botkit } = require('botkit');
const { SlackAdapter, SlackMessageTypeMiddleware, SlackEventMiddleware } = require('botbuilder-adapter-slack');

const adapter = new SlackAdapter({
  clientId: process.env.SLACK_CLIENT_ID,
  clientSecret: process.env.SLACK_CLIENT_SECRET,
  clientSigningSecret: process.env.SLACK_SIGNING_SECRET,
  redirectUri: '/nowhere',
  scopes: ['bot'],
  getTokenForTeam: async () => {
    return process.env.SLACK_OAUTH_TOKEN;
  },
  getBotUserByTeam: async () => {
    return process.env.SLACK_OAUTH_BOT_USER_TOKEN;
  },
});

adapter.use(new SlackEventMiddleware());
adapter.use(new SlackMessageTypeMiddleware());

const controller = new Botkit({
  debug: true,
  adapter,
});

module.exports = controller;
