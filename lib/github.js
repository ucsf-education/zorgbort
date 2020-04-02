'use strict';
if (!process.env.GITHUB_TOKEN) {
  throw new Error('Error: Specify GITHUB_TOKEN in environment');
}

const { Octokit } = require('@octokit/rest');

const octokit = new Octokit({
  auth: `token ${process.env.GITHUB_TOKEN}`,
  userAgent: 'zorgbort ilios bot',
  request: {
    timeout: 5000
  }
});

module.exports = octokit;
