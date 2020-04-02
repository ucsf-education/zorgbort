'use strict';
const excuse = require('huh');
const os = require('os');

const hi = async (bot, message) => {
  try {
    await bot.api.reactions.add({
      timestamp: message.ts,
      channel: message.channel,
      name: 'robot_face',
    });
  } catch (err) {
    if (err) {
      console.log('Failed to add emoji reaction :(', err);
    }
  }
  await bot.reply(message, 'Hello.');
};

const uptime = async (bot, message) => {
  const formatUptime = uptime => {
    let unit = 'second';
    if (uptime > 60) {
      uptime = uptime / 60;
      unit = 'minute';
    }
    if (uptime > 60) {
      uptime = uptime / 60;
      unit = 'hour';
    }
    if (uptime !== 1) {
      unit = unit + 's';
    }

    uptime = uptime + ' ' + unit;
    return uptime;
  };
  const hostname = os.hostname();
  const uptime = formatUptime(process.uptime());
  // @todo figure out how to get the bot's name from the API and add it to the response. [ST 2020/03/18]
  const response = ':robot_face: I am a bot, and I have been running for ' + uptime + ' on ' + hostname + '.';
  await bot.reply(message, response);
};

const defaultExcuse = async (bot, message) => {
  const msg = message.text;
  const reason = excuse.get('en');
  await bot.reply(message, `Sorry, I don't know how to _${msg}_. It must be *${reason}!*`);
};

const listUsers = async (bot, message) => {
  try {
    const resp = await bot.api.users.list();
    const users = resp.members.map(obj => `${obj.id}: ${obj.real_name}`);
    /* eslint-disable-next-line quotes */
    await bot.reply(message, 'Users: ' + users.join("\n"));
  } catch(err) {
    if (err) {
      await bot.reply(message, `Error: ${err.message} (stack trace in logs)`);
      console.log(err);
    }
  }
};

module.exports = { hi, uptime, defaultExcuse, listUsers };
