'use strict';

const generateReleaseNotes = require('../lib/generateReleaseNotes');
const assert = require('assert');

describe('Generate Release Notes', function() {
  const labels = {
    bug: {name: 'bug'},
    enhancement: {name: 'enhancement'},
    greenkeeper: {name: 'greenkeeper'},
    readyForReview: {name: 'ready for review'},
    worksForMe: {name: 'wontfix/works for me'},
    duplicate: {name: 'duplicate'},
  };
  const issues = {
    first: {title: 'first', number: '1', html_url: 'http://example.com', labels:[labels.bug]},
    second: {title: 'second', number: '2', html_url: 'http://example.com', labels:[labels.enhancement]},
    third: {title: 'third', number: '3', html_url: 'http://example.com', labels:[labels.bug, labels.enhancement]},
    fourth: {title: 'fourth', number: '4', html_url: 'http://example.com', labels:[labels.greenkeeper, labels.bug]},
    fifth: {title: 'fifth', number: '5', html_url: 'http://example.com', labels:[labels.readyForReview]},
    sixth: {title: 'sixth', number: '6', html_url: 'http://example.com', labels:[labels.bug], pull_request: true, user: {login: 'person', html_url: 'ex.com'}},
    seventh: {title: 'seventh', number: '7', html_url: 'http://example.com', labels:[labels.worksForMe]},
    eighth: {title: 'eighth', number: '8', html_url: 'http://example.com', labels:[labels.duplicate]},
  };

  const MockGithub =  {
    repos: {
      getTags({owner, repo, per_page}) {
        assert.equal(owner, 'testowner');
        assert.equal(repo, 'testrepo');
        assert.equal(per_page, 1);

        return Promise.resolve({data: [{name: 'v1.0', commit: {sha: 'abc123'}}]});
      }
    },
    gitdata: {
      getCommit({owner, repo, sha}) {
        assert.equal(owner, 'testowner');
        assert.equal(repo, 'testrepo');
        assert.equal(sha, 'abc123');

        return Promise.resolve({data: {committer: {date: '2001-01-01'}}});
      }
    },
    issues: {
      getForRepo({owner, repo, since, state}) {
        assert.equal(owner, 'testowner');
        assert.equal(repo, 'testrepo');
        assert.equal(since, '2001-01-01');
        assert.equal(state, 'closed');
        return Promise.resolve({data: [
          issues.first,
          issues.second,
          issues.third,
          issues.fourth,
          issues.fifth,
          issues.sixth,
          issues.seventh,
          issues.eighth,
        ]});
      }
    }
  };

  const MockHandlebars = {
    compile(string){
      assert.equal(string, 'RELEASENOTES');

      return ({pullRequests, bugs, enhancements, remaining, releaseName, releaseTag, currentTag, repositoryUrl}) => {
        assert.equal(pullRequests.length, 1);
        assert.equal(pullRequests[0].title, issues.sixth.title);

        assert.equal(bugs.length, 2);
        assert.equal(bugs[0].title, issues.first.title);
        assert.equal(bugs[1].title, issues.third.title);

        assert.equal(enhancements.length, 1);
        assert.equal(enhancements[0].title, issues.second.title);

        assert.equal(remaining.length, 1);
        assert.equal(remaining[0].title, issues.fifth.title);

        assert.equal(releaseName, 'Cheddar');
        assert.equal(releaseTag, 'v1.4');
        assert.equal(currentTag, 'v1.0');
        assert.equal(repositoryUrl, 'https://github.com/testowner/testrepo');

        return 'renderedReleaseNotes';

      };
    }
  };

  const MockFs = {
    readFile(path){
      assert.equal(path.substr(path.length - 17), 'release-notes.hbs');

      return Promise.resolve('RELEASENOTES');
    }
  };
  it('Works', async function() {
    const result = await generateReleaseNotes(MockGithub, MockHandlebars, MockFs, 'testowner', 'testrepo', 'Cheddar', 'v1.4');
    assert.equal(result, 'renderedReleaseNotes');
  });
  it('Fails when there are no tags', async function() {
    const MockGithub =  {
      repos: {
        getTags() {
          return Promise.resolve({data: []});
        }
      },
    };
    try {
      await generateReleaseNotes(MockGithub, MockHandlebars, MockFs, 'testowner', 'testrepo', 'Cheddar', 'v1.4');
    } catch (e) {
      assert.equal(e.message, 'testowner:testrepo has no tags.  Add at least one to get started.');
    }
  });
});
