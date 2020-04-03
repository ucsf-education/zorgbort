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

const uniqueid = require('uniqueid');
const getUniqueId = uniqueid(process.pid);
const fs = require('mz/fs');
const Git = require('nodegit');
const Github = require('../lib/github');
const randomDogBreed = require('dog-breed-names').random;
const rmdir = require('rimraf');
const moment = require('moment');
const uniqueReleaseName = require('../lib/uniqueReleaseName');
const { generateReleaseNotes } = require('generate-github-release-notes');
const incrementPackageVersion = require('../lib/incrementPackageVersion');
const { releaseList } = require('../lib/releaseList');

const VALID_RELEASE_USERS = process.env.VALID_RELEASE_USERS;
const releaseProject = 'release-project';
const releaseType = 'release-type';
const releaseFinal = 'release-final';

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
  await fs.mkdir(dir, { recursive: true });
  console.log(`${dir} created`);

  return dir;
};

const removeTempDirectory = async (name) => {
  const dir = `/tmp/${name}/` + getUniqueId();
  console.log(`Removing temporary directory ${dir}`);

  await rmdir(dir, err => {
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
    draft: false,
    prerelease: false,
  });

  return {
    version,
    releaseName,
    releaseUrl: release.data.html_url
  };
};

const createActionReply = (text, action, elements) => {
  return {
    'blocks': [
      {
        'type': 'section',
        'text': {
          'type': 'plain_text',
          'text': "Let's release some code"
        }
      },
      {
        'type': 'section',
        'text': {
          'type': 'plain_text',
          'text': text,
        },
      },
      {
        'type': 'actions',
        'block_id': action,
        'elements': elements
      }
    ]
  };
};

const getPersonFromMessage = (message) => {
  let person = '<@' + message.user + '>';
  if (message.channel[0] === 'D') {
    person = 'You';
  }
  return person;
};

const startRelease = async (bot, message) => {
  await bot.reply(message, createActionReply(':cool: I just need to know:', releaseProject, [
    {
      'type': 'static_select',
      'placeholder': {
        'type': 'plain_text',
        'text': 'Which Project?'
      },
      'action_id': 'select_project',
      'options': [
        {
          'text': {
            'type': 'plain_text',
            'text': 'Ilios Frontend',
          },
          'value': 'frontend',
        },
        {
          'text': {
            'type': 'plain_text',
            'text': 'Ilios Common Addon'
          },
          'value': 'common',
        },
        {
          'text': {
            'type': 'plain_text',
            'text': 'Ilios LTI Server',
          },
          'value': 'lti-server',
        },
        {
          'text': {
            'type': 'plain_text',
            'text': 'Ilios LTI Dashboard',
          },
          'value': 'lti-dashboard',
        },
        {
          'text': {
            'type': 'plain_text',
            'text': 'Ember Simple Charts',
          },
          'value': 'ember-simple-charts',
        },
      ]
    },
    {
      'type': 'button',
      'text': {
        'type': 'plain_text',
        'text': 'Cancel'
      },
      'value': 'cancel',
      'action_id': 'cancel'
    }
  ]));
};

const chooseReleaseType = async (bot, message, blockAction) => {
  if ('cancel' === blockAction.value) {
    await bot.replyInteractive(message, 'Done! Your release has been canceled.');
    return;
  }
  const selection = blockAction.selected_option.value;
  const person = getPersonFromMessage(message);
  const reply = createActionReply('What kind of change is this?', releaseType, [
    {
      'type': 'button',
      'text': {
        'type': 'plain_text',
        'text': 'Breaking / API Bump'
      },
      'value': selection + '$$major',
      'action_id': 'major',
      'style': 'danger'
    },
    {
      'type': 'button',
      'text': {
        'type': 'plain_text',
        'text': 'Feature'
      },
      'value': selection + '$$minor',
      'action_id': 'minor'
    },
    {
      'type': 'button',
      'text': {
        'type': 'plain_text',
        'text': 'Bugfix'
      },
      'value': selection + '$$patch',
      'action_id': 'patch',
      'style': 'primary'
    }
  ]);
  const text = person + ' chose to release ' + selection;
  reply.blocks.splice(1, 0, {
    'type': 'section',
    'text': {
      'type': 'plain_text',
      'text': text,
    }
  });
  console.log(reply);
  await bot.replyInteractive(message, reply);
};

const confirmRelease = async (bot, message, blockAction) => {
  const [selection, npmType] = blockAction.value.split('$$');
  const text = `
    I'm going to release a ${npmType} version of ${selection}.
    Is that correct?`;
  const reply = createActionReply(text, releaseFinal, [
    {
      'type': 'button',
      'text': {
        'type': 'plain_text',
        'text': 'Yes. Make it So!',
      },
      'value': selection + '$$' + npmType,
      'action_id': 'yes',
      'style': 'primary'
    },
    {
      'type': 'button',
      'text': {
        'type': 'plain_text',
        'text': 'No. Belay that Order!',
      },
      'value': 'cancel',
      'action_id': 'cancel',
      'style': 'danger'
    }
  ]);

  await bot.replyInteractive(message, reply);
};

const doRelease = async (bot, message, blockAction) => {
  if ('cancel' === blockAction.value) {
    await bot.replyInteractive(message, 'OK Consider it Canceled!');
    return;
  }
  // authorization
  // @todo add this to every step of this process [ST 2020/04/03]
  const user = message.user;
  const validUsers = VALID_RELEASE_USERS.split(',');
  if (! validUsers.includes(user)) {
    try {
      const response = await bot.api.users.info({user: message.user});
      let bestName = 'Dave';
      if (response.ok) {
        bestName = response.user.profile.first_name ? response.user.profile.first_name : response.user.name;
      }
      await bot.reply(message, `:no_entry: I'm sorry ${bestName}, I'm afraid Zorgbort can't do that.`);
    } catch (err) {
      console.error(err);
      await bot.reply(message, `Error: ${err.message} (stack trace in logs)`);
    }
    return;
  }

  const [repo, releaseType] = blockAction.value.split('$$');
  const person = getPersonFromMessage(message);
  await bot.replyInteractive(message, {
    'blocks': [
      {
        'type': 'section',
        'text': {
          'type': 'plain_text',
          'text': `${person} chose to release a ${releaseType} version of ${repo}.`
        }
      },
      {
        'type': 'section',
        'text': {
          'type': 'plain_text',
          'text': ":robot_face: Ok, I'm building your release now..."
        }
      }
    ]
  });
  const owner = 'ilios';
  let namer = version => `${version}`;
  switch (repo) {
  case 'frontend':
    namer = randomDogBreed;
    break;
  case 'common':
    namer = version => `Ilios Common ${version}`;
    break;
  case 'lti-server':
    namer = version => `LTI Server ${version}`;
    break;
  case 'lti-dashboard':
    namer = version => `LTI Dashboard ${version}`;
    break;
  }

  try {
    const { releaseName, releaseUrl } = await releaseAndTag(owner, repo, releaseType, namer);

    await bot.replyInteractive(message, {
      'blocks': [
        {
          'type': 'section',
          'text': {
            'type': 'plain_text',
            'text': `${person} chose to release a ${releaseType} version of ${repo}.`
          }
        },
        {
          'type': 'section',
          'text': {
            'type': 'plain_text',
            'text': `:rocket: ${owner}:${repo} ${releaseName} has been released. :tada:`,
          }
        },
        {
          'type': 'section',
          'text': {
            'type': 'mrkdwn',
            'text': `Release notes at ${releaseUrl}.`,
          }
        }
      ]
    });
  } catch (err) {
    console.error(err);
    await bot.reply(message, `Error: ${err.message} (stack trace in logs)`);
  }
};

const releaseStepsActionHandler = async (bot, message) => {
  const blockAction = message.incoming_message.channelData.actions[0];
  const action = blockAction.block_id;
  switch (action) {
  case releaseProject:
    await chooseReleaseType(bot, message, blockAction);
    break;
  case releaseType:
    await confirmRelease(bot, message, blockAction);
    break;
  case releaseFinal:
    await doRelease(bot, message, blockAction);
    break;
  default:
    // do nothing
  }
};

module.exports = { releaseStepsActionHandler, startRelease };
