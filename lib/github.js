if (!process.env.GITHUB_TOKEN) {
  throw new Error('Error: Specify GITHUB_TOKEN in environment');
}

import { Octokit } from '@octokit/rest';

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
  userAgent: 'zorgbort ilios bot',
  request: {
    timeout: 5000,
  },
});

export default octokit;
