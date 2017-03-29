'use strict';

const getLatestTag = async (Github, owner, repo) => {
  const tags = await Github.repos.getTags({
    owner,
    repo,
    per_page: 1
  });
  if (tags.data.length === 0) {
    throw new Error(`${owner}:${repo} has no tags.  Add at least one to get started.`);
  }
  const name = tags.data[0].name;
  const sha = tags.data[0].commit.sha;

  const tagCommit = await Github.gitdata.getCommit({
    owner,
    repo,
    sha
  });

  const date = tagCommit.data.committer.date;

  return {name, date};
};

const getClosedIssues = async (Github, owner, repo, since) => {
  const result = await Github.issues.getForRepo({
    owner,
    repo,
    since,
    state: 'closed'
  });
  const issues = result.data;
  const labelArrays = issues.map(obj => obj.labels);
  let labels = [];
  for (let i = 0; i < labelArrays.length; i++) {
    const arr = labelArrays[i];
    const names = arr.map(obj => obj.name);
    labels = labels.concat(names);
  }
  const minimalIssues = issues.map(({title, number, html_url, labels, user, pull_request = false}) => {
    const labelTitles = labels.map(obj => obj.name);
    let minimalUser = null;
    if (user) {
      minimalUser = {
        login: user.login,
        url: user.html_url
      };
    }
    return {title, number, url: html_url, pull_request, user: minimalUser, labels: labelTitles};
  });
  const skippedIssues = minimalIssues.filter(({labels}) => {
    return !labels.includes('greenkeeper') &&
           !labels.includes('duplicate') &&
           !labels.includes('wontfix/works for me')
    ;
  });
  const pullRequests = skippedIssues.filter(({pull_request}) => pull_request);
  const bugs = skippedIssues.filter(obj => obj.labels.includes('bug') && !pullRequests.includes(obj));
  const enhancements = skippedIssues.filter(obj => obj.labels.includes('enhancement') && !bugs.includes(obj) && !pullRequests.includes(obj));
  const remaining = skippedIssues.filter(obj => !pullRequests.includes(obj) && !bugs.includes(obj) && !enhancements.includes(obj));

  return {pullRequests, bugs, enhancements, remaining};
};

const generateReleaseNotes = async (Github, Handlebars, fs, owner, repo, releaseName, releaseTag) => {
  const latestTag = await getLatestTag(Github, owner, repo);
  const {pullRequests, bugs, enhancements, remaining} = await getClosedIssues(Github, owner, repo, latestTag.date);
  const appRoot = require('app-root-path');
  const template = await fs.readFile(`${appRoot}/templates/release-notes.hbs`);
  const hbs = Handlebars.compile(template.toString());
  const currentTag = latestTag.name;
  const repositoryUrl = `https://github.com/${owner}/${repo}`;
  const markdown = hbs({pullRequests, bugs, enhancements, remaining, releaseName, releaseTag, currentTag, repositoryUrl});

  return markdown;
};

module.exports = generateReleaseNotes;
