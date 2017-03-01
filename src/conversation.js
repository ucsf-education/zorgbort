'use strict';
/*
  Many thanks to https://github.com/howdyai/botkit/blob/master/slack_bot.js
  Where most of this was stolen from
*/

const excuse = require('huh');
const os = require('os');

const hi = (bot, message) => {
  bot.api.reactions.add({
    timestamp: message.ts,
    channel: message.channel,
    name: 'robot_face',
  }, function(err) {
    if (err) {
      bot.botkit.log('Failed to add emoji reaction :(', err);
    }
  });
  bot.reply(message, 'Hello.');
};

const shutdown = (bot, message) => {
  bot.startConversation(message, function(err, convo) {
    convo.ask('Are you sure you want me to shutdown?', [
      {
        pattern: bot.utterances.yes,
        callback: function(response, convo) {
          convo.say("Alright Sir, if you'll not be needing me, I'll close down for awhile");
          convo.next();
          setTimeout(function() {
            process.exit();
          }, 3000);
        }
      },
      {
        pattern: bot.utterances.no,
        default: true,
        callback: function(response, convo) {
          convo.say('*ZORGBORT LIVES!*');
          convo.next();
        }
      }
    ]);
  });
};

const uptime = (bot, message) => {
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
  const reponse = ':robot_face: I am a bot named <@' + bot.identity.name +
          '>. I have been running for ' + uptime + ' on ' + hostname + '.';
  bot.reply(message, reponse);
};

const defaultExcuse = (bot, message) => {
  const msg = message.text;
  const reason = excuse.get('en');
  bot.reply(message, `Sorry, I don't know how to _${msg}_. It must be *${reason}!*`);
};

const mention = ['direct_message','direct_mention','mention'];
module.exports = bot => {
  bot.hears(['hello', 'hi', 'howdy', 'sup', 'howzit'], mention, hi);
  bot.hears(['shutdown', 'powerdown'], mention, shutdown);
  bot.hears(['uptime', 'identify yourself', 'who are you', 'what is your name'], mention, uptime);
  bot.hears('', mention, defaultExcuse);
};
