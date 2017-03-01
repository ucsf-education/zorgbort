const github = require('../lib/github.js');

const releaseList = (repo, callback) => {
  return github.repos.getReleases({
    owner: 'ilios',
    repo
  }, (err, response) => {
    let titles = response.data.map(obj => {
      return obj.name;
    });
    callback(err, titles);
  });
};

const listFrontendReleases = (bot, message) => {
  releaseList('frontend', (err, response) => {
    if (!err) {
      bot.reply(message, response.join(', '));
    } else {
      console.error(`cleverbot error: ${err}`);
    }
  });
};

module.exports = bot => {
  bot.hears('list frontend releases','direct_message,direct_mention,mention', listFrontendReleases);
};
