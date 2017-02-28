const github = require('../lib/github.js');

const list = callback => {
  return github.repos.getReleases({
    owner: 'ilios',
    repo: 'frontend'
  }, (err, response) => {
    let titles = response.data.map(obj => {
      return obj.name;
    });
    callback(err, titles);
  });
};
module.exports = {
  list
};
