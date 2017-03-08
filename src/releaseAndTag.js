'use strict';

if (!process.env.SSH_KEY_PASSPHRASE) {
  throw new Error('Error: Specify SSH_KEY_PASSPHRASE in environment');
}

const SSH_KEY_PASSPHRASE = process.env.SSH_KEY_PASSPHRASE;

const uniqueid = require('uniqueid');
const getUniqueId = uniqueid(process.pid);
const fs = require('mz/fs');
const childProcess = require('mz/child_process');
const Git = require('nodegit');
const Github = require('../lib/github');
const cheeseName = require('cheese-name');
const uniqueReleaseName = require('../lib/uniqueReleaseName');

const { exec } = childProcess;

const cloneFrontend = async target => {
  const url = 'git@github.com:ilios/frontend.git';
  const appRoot = require('app-root-path');
  const sshPublicKeyPath = appRoot + '/ssh-keys/zorgbort-frontend.pub';
  const sshPrivateKeyPath = appRoot + '/ssh-keys/zorgbort-frontend';
  const opts = {
    fetchOpts: {
      callbacks: {
        credentials: function(url, userName) {
          return Git.Cred.sshKeyNew(
            userName,
            sshPublicKeyPath,
            sshPrivateKeyPath,
            SSH_KEY_PASSPHRASE
          );
        }
      }
    }
  };

  return await Git.Clone(url, target, opts);
};

const createTempDirectory = (name) => {
  const appRoot = require('app-root-path');
  const dir = `/tmp/${name}/` + getUniqueId();
  if (fs.existsSync(dir)) {
    throw new Error(`Tried to create directory, but it already exists: ${dir}`);
  }
  //create our temporary file system in parts
  dir.split('/').reduce((path, folder) => {
    path += folder + '/';
    if (!fs.existsSync(path)){
      fs.mkdirSync(path);
    }
    return path;
  }, appRoot);

  return appRoot + dir;
};

const releaseAndTag = async (repo, name, releaseType) => {
  const dir = createTempDirectory(name);
  await cloneFrontend(dir);
  const releaseName = await uniqueReleaseName(Github, cheeseName, 'ilios', 'frontend');
  const commands = [
    `cd ${dir}`,
    `npm version ${releaseType} -m "%s ${releaseName}"`,
  ];
  const str = commands.join(';');
  const result = await exec(str);
  const version = result[0].replace(/\n+/g, '');
  return {
    version,
    releaseName
  };
};

const releaseAndTagFrontend = (bot, message) => {
  const repostiory = 'git@github.com:ilios/frontend.git';
  const name = 'frontend';
  bot.startConversation(message, function(err, convo) {
    convo.ask('Is this a feature or a bugfix release?', [
      {
        pattern: '(feature|bugfix)',
        callback: (response, convo) => {
          convo.say(`Ok, starting ${response.text} release for ${name}`);
          convo.next();
        }
      },
      {
        default: true,
        callback: function(response, convo) {
          convo.say("Sorry that's not what I asked...");
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
          const result = await releaseAndTag(repostiory, name, npmType);

          bot.reply(message, `${name} ${result.version} ${result.releaseName} has been released`);
        } catch (e) {
          bot.reply(message, `Error: ${e.message}`);
        }


      } else {
        bot.reply(message, 'OK, nevermind!');
      }
    });
  });
};

module.exports = bot => {
  bot.hears('release frontend', 'direct_message,direct_mention,mention', releaseAndTagFrontend);
};
