'use strict';
/*
  Many thanks to https://github.com/howdyai/botkit/blob/master/slack_bot.js
  Where most of this was stolen from
*/

const excuse = require('huh');
const os = require('os');

const hi = async (bot, message) => {
  await bot.api.reactions.add({
    timestamp: message.ts,
    channel: message.channel,
    name: 'robot_face',
  });
  await bot.reply(message, 'Hello.');
};

const indirectHi = async (bot, message) => {
  await bot.api.reactions.add({
    timestamp: message.ts,
    channel: message.channel,
    name: 'wave',
  });
};

const uptime = async (bot, message) => {
  const formatUptime = function(uptime) {
    var unit = 'second';
    if (uptime > 60) {
      uptime = uptime / 60;
      unit = 'minute';
    }
    if (uptime > 60) {
      uptime = uptime / 60;
      unit = 'hour';
    }
    if (uptime != 1) {
      unit = unit + 's';
    }

    uptime = uptime + ' ' + unit;
    return uptime;
  };
  const hostname = os.hostname();
  const uptime = formatUptime(process.uptime());
  const reponse = ':robot_face: I am a bot and have been running for ' +
    uptime + ' on ' + hostname + '.';
  await bot.reply(message, reponse);
};

const defaultExcuse = async (bot, message) => {
  const msg = message.text;
  const reason = excuse.get('en');
  await bot.reply(message, `Sorry, I don't know how to _${msg}_. It must be *${reason}!*`);
};

const listUsers = async (bot, message) => {
  const resp = await bot.api.users.list({});
  const users = resp.members.map(obj => `${obj.id}: ${obj.real_name}`);
  /* eslint-disable-next-line quotes */
  await bot.reply(message, 'Users: ' + users.join("\n"));
};

const mention = ['direct_message', 'direct_mention', 'mention'];
module.exports = bot => {
  bot.hears(['hello', 'hi', 'howdy', 'sup', 'howzit'], mention, hi);
  bot.hears(['hello', 'hi', 'howdy', 'sup', 'howzit', 'good morning'], 'message_received', indirectHi);
  bot.hears(['uptime', 'identify yourself', 'who are you', 'what is your name'], mention, uptime);
  bot.hears(['list users'], mention, listUsers);
  bot.hears('', mention, defaultExcuse);
};
