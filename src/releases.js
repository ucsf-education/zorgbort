'use strict';

const { releaseList } = require('../lib/releaseList');

const releaseListChooseProject = 'release-list-project';

const listReleases = async (bot, message) => {
  await bot.reply(message, {
    text: 'Ok, I will look up a release list for you',
    attachments: [
      {
        title: 'Which project?',
        callback_id: releaseListChooseProject,
        attachment_type: 'default',
        actions: [
          {
            'name': 'frontend',
            'text': 'Ilios Frontend',
            'value': 'frontend',
            'type': 'button',
          },
          {
            'name': 'common',
            'text': 'Ilios Common Addon',
            'value': 'common',
            'type': 'button',
          },
          {
            'name': 'lti-server',
            'text': 'Ilios LTI Server',
            'value': 'lti-server',
            'type': 'button',
          },
          {
            'name': 'lti-dashboard',
            'text': 'Ilios LTI Dashboard',
            'value': 'lti-dashboard',
            'type': 'button',
          },
        ]
      }
    ]
  });
};

const releaseInteraction = async (bot, message) => {
  const reply = message.original_message;
  if (message.callback_id === releaseListChooseProject) {
    const selection = message.actions[0].value;
    for (let a = 0; a < reply.attachments.length; a++) {
      reply.attachments[a].actions = null;
    }
    let person = '<@' + message.user + '>';
    if (message.channel[0] == 'D') {
      person = 'You';
    }
    const text = person + ' chose ' + selection;
    reply.attachments.push({ text });

    await bot.replyInteractive(message, reply);
    if (selection === 'frontend') {
      const releases = await releaseList('ilios', 'frontend');
      await bot.replyInThread(reply, releases.join(', '));
    }
    if (selection === 'common') {
      const releases = await releaseList('ilios', 'common');
      await bot.replyInThread(reply, releases.join(', '));
    }
    if (selection === 'lti-server') {
      const releases = await releaseList('ilios', 'lti-server');
      await bot.replyInThread(reply, releases.join(', '));
    }
    if (selection === 'lti-dashboard') {
      const releases = await releaseList('ilios', 'lti-dashboard');
      await bot.replyInThread(reply, releases.join(', '));
    }
  }
};

module.exports = bot => {
  bot.hears('list releases', ['direct_message', 'direct_mention', 'mention'], listReleases);
  bot.on('message', releaseInteraction);
};
