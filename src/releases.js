'use strict';
const { releaseList } = require('../lib/releaseList');
const releaseListChooseProject = 'release-list-project';

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

module.exports = { listReleases, releaseInteraction };
