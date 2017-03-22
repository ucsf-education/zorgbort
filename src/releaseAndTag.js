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
  throw new Error('Error: Specify comma seperated list of VALID_RELEASE_USERS in environment');
}

const VALID_RELEASE_USERS = process.env.VALID_RELEASE_USERS;

const uniqueid = require('uniqueid');
const getUniqueId = uniqueid(process.pid);
const fs = require('mz/fs');
const Git = require('nodegit');
const Github = require('../lib/github');
const Handlebars = require('handlebars');
const cheeseName = require('cheese-name');
const rmdir = require('rimraf');
const mkdirp = require('mkdirp');
const moment = require('moment');
const uniqueReleaseName = require('../lib/uniqueReleaseName');
const generateReleaseNotes = require('../lib/generateReleaseNotes');
const incrementPackageVersion = require('../lib/incrementPackageVersion');

const cloneRepository = async (owner, repo, target) => {
  const url = `git@github.com:${owner}/${repo}`;
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
  return await remote.push([
    'refs/heads/master:refs/heads/master',
    `refs/tags/${name}:refs/tags/${name}`,
  ], opts);
};

const createTempDirectory = async (name) => {
  const appRoot = require('app-root-path');
  const dir = `${appRoot}/tmp/${name}/` + getUniqueId();
  const exists = await fs.exists(dir);
  if (exists) {
    throw new Error(`Tried to create directory, but it already exists: ${dir}`);
  }
  mkdirp(dir);

  return dir;
};

const removeTempDirectory = async (name) => {
  const dir = `/tmp/${name}/` + getUniqueId();

  return await rmdir(dir, err => {
    console.error(err);
  });
};

const releaseAndTag = async (owner, repo, releaseType) => {
  const dir = await createTempDirectory(repo);
  await cloneRepository(owner, repo, dir);

  const plainVerion = await incrementPackageVersion(dir, releaseType);
  const version = `v${plainVerion}`;
  const releaseName = await uniqueReleaseName(Github, cheeseName, owner, repo);
  const releaseNotes = await generateReleaseNotes(Github, Handlebars, fs, owner, repo, releaseName, version);
  await commitAndTag(dir, version, releaseName);
  await removeTempDirectory(repo);

  const release = await Github.repos.createRelease({
    owner,
    repo,
    tag_name: version,
    name: releaseName,
    body: releaseNotes,
    draft: true
  });
  const releaseUrl = release.data.html_url;

  return {
    version,
    releaseName,
    releaseUrl
  };
};

const validateRequestAndStartConversation = async (bot, message, owner, repo) => {
  const user = message.user;

  const validUsers = VALID_RELEASE_USERS.split(',');
  if (validUsers.includes(user)) {
    releaseConversation(bot, message, owner, repo);
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

const releaseConversation = (bot, message, owner, repo) => {
  bot.startConversation(message, function(err, convo) {
    convo.ask(`Is this a feature or a bugfix release for ${owner}:${repo}?`, [
      {
        pattern: '(feature|bugfix)',
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
          const npmType = releaseType === 'bugfix'?'patch':'minor';
          const result = await releaseAndTag(owner, repo, npmType);

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
    validateRequestAndStartConversation(bot, message, owner, repo);
  });
  bot.hears('test release', mention, (bot, message) => {
    const owner = 'jrjohnson';
    const repo = 'test-releaser';
    validateRequestAndStartConversation(bot, message, owner, repo);
  });
};
