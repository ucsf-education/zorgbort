'use strict';
const cheeseName = require('cheese-name');
const randomDogBreed = require('dog-breed-names').random;
const { releaseList } = require('../lib/releaseList');
const excuse = require('huh');
const os = require('os');
// const { SlackDialog } = require('botbuilder-adapter-slack');

const releaseListChooseProject = 'release-list-project';

const randomCheese = async (bot, message) => {
  await bot.reply(message, cheeseName());
};

const randomDogbreed = async (bot, message) => {
  await bot.reply(message, randomDogBreed());
};

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

const listReleases = async (bot, message) => {
  await bot.reply(message, 'Ok, I will look up a release list for you.');
  await bot.reply(message, {
    blocks: [
      {
        'type': 'section',
        'text': {
          'type': 'plain_text',
          'text': 'Which project?',
        },
      },
      {
        'type': 'actions',
        'block_id': releaseListChooseProject,
        'elements': [
          {
            'type': 'button',
            'text': {
              'type': 'plain_text',
              'text': 'Ilios Frontend'
            },
            'value' : 'frontend',
          },
          {
            'type': 'button',
            'text': {
              'type': 'plain_text',
              'text': 'Ilios Common Addon'
            },
            'value' : 'common',
          },
          {
            'type': 'button',
            'text': {
              'type': 'plain_text',
              'text': 'Ilios LTI Server'
            },
            'value' : 'lti-server',
          },
          {
            'type': 'button',
            'text': {
              'type': 'plain_text',
              'text': 'Ilios LTI Dashboard'
            },
            'value' : 'lti-dashboard',
          }
        ],
      },
    ],
  });
};

const releaseInteraction = async (bot, message) => {
  const blockAction = message.incoming_message.channelData.actions[0];
  if (blockAction.block_id === releaseListChooseProject) {
    const selection = blockAction.value;

    let person = '<@' + message.user + '>';
    if (message.channel[0] === 'D') { // D indicates direct message.
      person = 'You';
    }
    const text = person + ' chose ' + selection;
    await bot.replyInteractive(message, text);
    if (['frontend', 'common', 'lti-server', 'lti-dashboard'].includes(selection)) {
      const releases = await releaseList('ilios', selection);
      // this method doesn't seem to work properly atm, no new thread get's spawned.
      // instead, a non-threaded response is emitted.
      // not a show stopper, but something to be aware of.
      // @todo investigate [ST 2020/04/01]
      await bot.replyInThread(message, releases.join(', '));
    }
  }
};

const mention = ['direct_message', 'direct_mention', 'mention'];

module.exports = controller => {
  controller.on('block_actions', releaseInteraction);
  controller.hears(['hello', 'hi', 'howdy', 'sup', 'howzit'], mention, hi);
  controller.hears(['uptime', 'identify yourself', 'who are you', 'what is your name'], mention, uptime);
  controller.hears(['list users'], mention, listUsers);
  controller.hears(['cheese?'], mention, randomCheese);
  controller.hears(['dog?'], mention, randomDogbreed);
  controller.hears('list releases', mention, listReleases);
  controller.hears('', mention, defaultExcuse);
};
