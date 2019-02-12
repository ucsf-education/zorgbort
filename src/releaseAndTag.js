'use strict';

if (!process.env.SSH_PRIVATE_KEY) {
  throw new Error('Error: Specify SSH_PRIVATE_KEY in environment');
}
const SSH_PRIVATE_KEY = process.env.SSH_PRIVATE_KEY;

if (!process.env.SSH_PUBLIC_KEY) {
  throw new Error('Error: Specify SSH_PUBLIC_KEY in environment');
}
const SSH_PUBLIC_KEY = process.env.SSH_PUBLIC_KEY;

if (!process.env.SSH_KEY_PASSPHRASE) {
  throw new Error('Error: Specify SSH_KEY_PASSPHRASE in environment');
}

const SSH_KEY_PASSPHRASE = process.env.SSH_KEY_PASSPHRASE;

if (!process.env.VALID_RELEASE_USERS) {
  throw new Error('Error: Specify comma separated list of VALID_RELEASE_USERS in environment');
}

const VALID_RELEASE_USERS = process.env.VALID_RELEASE_USERS;

const uniqueid = require('uniqueid');
const getUniqueId = uniqueid(process.pid);
const fs = require('mz/fs');
const Git = require('nodegit');
const Github = require('../lib/github');
const cheeseName = require('cheese-name');
const rmdir = require('rimraf');
const mkdirp = require('mkdirp');
const moment = require('moment');
const uniqueReleaseName = require('../lib/uniqueReleaseName');
const { generateReleaseNotes } = require('generate-github-release-notes');
const incrementPackageVersion = require('../lib/incrementPackageVersion');
const { releaseList } = require('../lib/releaseList');

const cloneRepository = async (owner, repo, target) => {
  const url = `git@github.com:${owner}/${repo}`;
  console.log(`Cloning ${url} into ${target}`);
  const opts = {
    fetchOpts: {
      callbacks: {
        credentials: async (url, userName) => {
          return await Git.Cred.sshKeyMemoryNew(
            userName,
            SSH_PUBLIC_KEY,
            SSH_PRIVATE_KEY,
            SSH_KEY_PASSPHRASE
          );
        }
      }
    }
  };

  return await Git.Clone(url, target, opts);
};

const commitAndTag = async (dir, name, releaseName) => {
  const message = `${name} ${releaseName}`;
  console.log(`Commit and tag ${message} in ${dir}`);

  // From the examples at https://github.com/nodegit/nodegit/blob/master/examples/
  const repository = await Git.Repository.open(dir);
  const index = await repository.refreshIndex();
  await index.addAll();
  await index.write();
  const oid = await index.writeTree();
  const HEAD = await Git.Reference.nameToId(repository, 'HEAD');
  const parent = await repository.getCommit(HEAD);

  const now = moment().utc().unix();
  const author = Git.Signature.create('Zorgbort', 'info@iliosproject.org', now, 0);
  const commit = await repository.createCommit('HEAD', author, author, message, oid, [parent]);

  console.log(`Create tag ${name} "${message}"`);
  await repository.createTag(commit, name, message);
  const opts = {
    callbacks: {
      credentials: async (url, userName) => {
        return await Git.Cred.sshKeyMemoryNew(
          userName,
          SSH_PUBLIC_KEY,
          SSH_PRIVATE_KEY,
          SSH_KEY_PASSPHRASE
        );
      }
    }
  };
  const remote = await Git.Remote.lookup(repository, 'origin');
  console.log('Pushing new tag to origin');
  return await remote.push([
    'refs/heads/master:refs/heads/master',
    `refs/tags/${name}:refs/tags/${name}`,
  ], opts);
};

const createTempDirectory = async (name) => {
  console.log(`Creating temporary directory for ${name}`);
  const appRoot = require('app-root-path');
  const dir = `${appRoot}/tmp/${name}/` + getUniqueId();
  const exists = await fs.exists(dir);
  if (exists) {
    throw new Error(`Tried to create directory, but it already exists: ${dir}`);
  }
  mkdirp(dir);
  console.log(`${dir} created`);

  return dir;
};

const removeTempDirectory = async (name) => {
  const dir = `/tmp/${name}/` + getUniqueId();
  console.log(`Removing temporary directory ${dir}`);

  return await rmdir(dir, err => {
    console.error(err);
  });
};

const releaseAndTag = async (owner, repo, releaseType, namer) => {
  console.log(`Release and tag ${owner}/${repo} as ${releaseType}`);
  const dir = await createTempDirectory(repo);
  await cloneRepository(owner, repo, dir);

  const { nextVersion, currentVersion } = await incrementPackageVersion(dir, releaseType);
  const version = `v${nextVersion}`;
  console.log(`${nextVersion} will be called ${version}`);
  const releaseName = await uniqueReleaseName(nextVersion, releaseList, namer, owner, repo);
  const releaseNotes = await generateReleaseNotes(Github, owner, repo, `v${currentVersion}`, version);
  await commitAndTag(dir, version, releaseName);
  await removeTempDirectory(repo);
  console.log(`Creating release for ${owner}/${repo} at ${version} as ${releaseName}`);

  const release = await Github.repos.createRelease({
    owner,
    repo,
    tag_name: version,
    name: releaseName,
    body: releaseNotes,
    draft: true,
    prerelease: false,
  });

  return {
    version,
    releaseName,
    releaseUrl: release.data.html_url
  };
};

const validateRequestAndStartConversation = async (bot, message, owner, repo, namer) => {
  const user = message.user;

  const validUsers = VALID_RELEASE_USERS.split(',');
  if (validUsers.includes(user)) {
    releaseConversation(bot, message, owner, repo, namer);
  } else {
    const bestname = await new Promise(resolve => {
      bot.api.users.info({user}, (err, resp) => {
        if (err) {
          bot.reply(message, `Error: ${err.message} (stack trace in logs)`);
          console.error(err);
        }
        if (!resp.ok) {
          resolve('Dave');
        } else if (resp.user.profile.first_name) {
          resolve(resp.user.profile.first_name);
        } else {
          resolve(resp.user.name);
        }
      });
    });
    bot.reply(message, `:no_entry: I'm Sorry, ${bestname}, I'm afraid Zorgbort can't do that.`);
  }
};

const releaseConversation = (bot, message, owner, repo, namer) => {
  bot.startConversation(message, function(err, convo) {
    convo.ask(`Is this a "major", "feature" or "bugfix" release for ${owner}:${repo}?`, [
      {
        pattern: '(major|feature|bugfix)',
        callback: (response, convo) => {
          convo.say(`Ok, starting ${response.text} release for ${owner}:${repo}`);
          convo.next();
        }
      },
      {
        pattern: '(stop|cancel|no|holdon|end|quit|die)',
        callback: (response, convo) => {
          convo.stop();
        }
      },
      {
        default: true,
        callback: function(response, convo) {
          convo.say("Sorry that's not what I asked...");
          convo.say("You can say 'feature', 'bugfix' or 'cancel'");
          convo.repeat();
          convo.next();
        }
      }
    ], {'key': 'releaseType'});

    convo.on('end', async convo => {
      if (convo.status == 'completed') {
        try {
          const releaseType = convo.extractResponse('releaseType');
          let npmType = 'major';
          if (releaseType === 'feature') {
            npmType = 'minor';
          }
          if (releaseType === 'bugfix') {
            npmType = 'patch';
          }
          const result = await releaseAndTag(owner, repo, npmType, namer);

          bot.reply(message, `:rocket: ${owner}:${repo} ${result.version} ${result.releaseName} has been released. :tada:`);
          bot.reply(message, `Please review and published the release notes at ${result.version} at ${result.releaseUrl}`);
        } catch (e) {
          bot.reply(message, `Error: ${e.message} (stack trace in logs)`);
          console.error(e);
        }


      } else {
        bot.reply(message, 'OK, nevermind!');
      }
    });
  });
};

module.exports = bot => {
  const mention = ['direct_message', 'direct_mention', 'mention'];
  bot.hears(['release the frontend', 'frontend release'], mention, (bot, message) => {
    const owner = 'ilios';
    const repo = 'frontend';
    validateRequestAndStartConversation(bot, message, owner, repo, cheeseName);
  });
  bot.hears(['release common addon', 'common addon release'], mention, (bot, message) => {
    const owner = 'ilios';
    const repo = 'common';
    const namer = version => `Ilios Common ${version}`;
    validateRequestAndStartConversation(bot, message, owner, repo, namer);
  });
  bot.hears(['release lti dashboard', 'lti dashboard release'], mention, (bot, message) => {
    const owner = 'ilios';
    const repo = 'lti-app';
    const namer = version => `Dashboard ${version}`;
    validateRequestAndStartConversation(bot, message, owner, repo, namer);
  });
  bot.hears(['release lti server', 'lti server release', 'release lti-server', 'lti-server release'], mention, (bot, message) => {
    const owner = 'ilios';
    const repo = 'lti-server';
    const namer = version => `${version}`;
    validateRequestAndStartConversation(bot, message, owner, repo, namer);
  });
};
