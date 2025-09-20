const { releaseList } = require('../lib/releaseList');
const { releaseLatest } = require('../lib/releaseLatest');
const { runTagWorkflow } = require('../lib/runTagWorkflow');

if (!process.env.VALID_RELEASE_USERS) {
  throw new Error('Error: Specify comma separated list of VALID_RELEASE_USERS in environment');
}

module.exports = class Home {
  isHome = false;
  interactionType = null;

  isUserValid(userId) {
    const validUsers = process.env.VALID_RELEASE_USERS.split(',').map((s) => s.trim());
    return validUsers.includes(userId);
  }

  async getNavigationBlocks() {
    const elements = [
      {
        type: 'button',
        text: {
          type: 'plain_text',
          text: 'Latest Release',
          emoji: true,
        },
        action_id: `${this.interactionType}_latest_release_chooser`,
      },
      {
        type: 'button',
        text: {
          type: 'plain_text',
          text: 'List Releases',
          emoji: true,
        },
        action_id: `${this.interactionType}_list_releases_chooser`,
      },
      {
        type: 'button',
        text: {
          type: 'plain_text',
          text: 'Release Project',
          emoji: true,
        },
        action_id: `${this.interactionType}_release_project_chooser`,
      },
    ];
    if (this.isHome) {
      elements.unshift({
        type: 'button',
        text: {
          type: 'plain_text',
          text: 'Home',
          emoji: true,
        },
        style: 'primary',
        action_id: `${this.interactionType}_reload_home`,
      });
    }
    return [
      {
        type: 'actions',
        elements,
      },
      {
        type: 'divider',
      },
    ];
  }

  async getReleaseChooserBlocks(latest = null) {
    return [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: 'What project would you like releases for?',
        },
        accessory: {
          action_id: latest
            ? `${this.interactionType}_latest_release_for`
            : `${this.interactionType}_list_releases_for`,
          type: 'static_select',
          placeholder: {
            type: 'plain_text',
            text: 'Ilios Projects',
          },
          options: [
            {
              text: {
                type: 'plain_text',
                text: 'Frontend',
              },
              value: 'frontend',
            },
            {
              text: {
                type: 'plain_text',
                text: 'API',
              },
              value: 'ilios',
            },
            {
              text: {
                type: 'plain_text',
                text: 'Simple Charts',
              },
              value: 'ember-simple-charts',
            },
            {
              text: {
                type: 'plain_text',
                text: 'LTI Server',
              },
              value: 'lti-server',
            },
          ],
        },
      },
    ];
  }

  async getProgressSpinnerBlocks(what) {
    return [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `Working on ${what}....`,
        },
        accessory: {
          type: 'image',
          image_url: 'https://media.giphy.com/media/JIX9t2j0ZTN9S/giphy.gif',
          alt_text: 'Cat Typing',
        },
      },
    ];
  }

  async getReleaseLatestBlocksFor(project, name) {
    const release = await releaseLatest('ilios', project);
    const link = release.data.html_url;
    const text = release.data.name;
    const tag = release.data.tag_name;

    return [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `Latest Release For *${name}*: <${link}|${text}> (${tag})`,
        },
      },
    ];
  }

  async getReleaseListBlocksFor(project, name) {
    const releases = await releaseList('ilios', project);

    let list = releases.join('\n * ');
    if (list.length > 2999) {
      list = list.substr(0, 2000) + '\n\n *List Truncated at Maximum Length*';
    }

    return [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `Releases For ${name}:\n * ` + list,
        },
      },
    ];
  }

  async getReleaseProjectChooserBlocks() {
    return [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: 'Ok. Which project do you want to release?',
        },
        accessory: {
          action_id: `${this.interactionType}_choose_release_type`,
          type: 'static_select',
          placeholder: {
            type: 'plain_text',
            text: 'Ilios Projects',
          },
          options: [
            {
              text: {
                type: 'plain_text',
                text: 'Test Release Workspace',
              },
              value: 'jrjohnson/test-release-workspace',
            },
            {
              text: {
                type: 'plain_text',
                text: 'Ilios Frontend',
              },
              value: 'ilios/frontend',
            },
            {
              text: {
                type: 'plain_text',
                text: 'Ilios API',
              },
              value: 'ilios/ilios',
            },
            {
              text: {
                type: 'plain_text',
                text: 'LTI Server',
              },
              value: 'ilios/lti-server',
            },
            {
              text: {
                type: 'plain_text',
                text: 'Ember Simple Charts',
              },
              value: 'ilios/ember-simple-charts',
            },
          ],
        },
      },
    ];
  }

  async getReleaseTypeChooseBlocksFor(project, name) {
    let branch = 'master';
    if (project === 'jrjohnson/test-release-workspace') {
      branch = 'main';
    }
    const options = [
      {
        text: {
          type: 'plain_text',
          text: 'Feature/Minor',
        },
        value: `${project}x::xminorx::x${branch}`,
      },
      {
        text: {
          type: 'plain_text',
          text: 'Bugfix/Patch',
        },
        value: `${project}x::xpatchx::x${branch}`,
      },
    ];
    //We don't do major releases of the API
    if (project !== 'ilios/ilios') {
      options.unshift({
        text: {
          type: 'plain_text',
          text: 'Breaking/API Bump/Major',
        },
        value: `${project}x::xmajorx::x${branch}`,
      });
    }
    return [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `What *_type_* of release do you want to do for *${name}*?`,
        },
        accessory: {
          action_id: `${this.interactionType}_confirm_release`,
          type: 'static_select',
          placeholder: {
            type: 'plain_text',
            text: 'Release Type',
          },
          options,
        },
      },
    ];
  }

  getDetailsFromReleaseMessage(str) {
    const [project, type, branch] = str.split('x::x');
    const [owner, repo] = project.split('/');

    return { project, type, owner, branch, repo };
  }

  async getReleaseConfirmationBlocksFor(project, branch, type) {
    const confirmationValue = `${project}x::x${type}x::x${branch}`;

    return [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `Are you ready to release a *_${type}_* version of \`${project}\`?`,
        },
      },
      {
        type: 'actions',
        elements: [
          {
            type: 'button',
            text: {
              type: 'plain_text',
              text: 'Make it so',
            },
            value: confirmationValue,
            action_id: `${this.interactionType}_release_project`,
            style: 'primary',
          },
          {
            type: 'button',
            text: {
              type: 'plain_text',
              text: 'Halt and Abort',
              emoji: true,
            },
            value: confirmationValue,
            action_id: `${this.interactionType}_cancel`,
            style: 'danger',
          },
        ],
      },
    ];
  }

  async getCancelBlock(project, type) {
    return [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `Release of *_${type}_* version for \`${project}\` was canceled.`,
        },
      },
    ];
  }

  async doReleaseProjectFor(owner, repo, branch, type) {
    await runTagWorkflow(owner, repo, branch, type);

    return [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `:white_check_mark: Done! A *_${type}_* version of \`${owner}/${repo}\` released! :rocket:`,
        },
      },
    ];
  }
};
