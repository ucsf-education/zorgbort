const { releaseList } = require('../lib/releaseList');
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

  async getReleaseChooserBlocks() {
    return [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: 'What project would you like releases for?',
        },
        accessory: {
          action_id: `${this.interactionType}_list_releases_for`,
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
                text: 'Common',
              },
              value: 'common',
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
          text: `Woking on ${what}....`,
        },
        accessory: {
          type: 'image',
          image_url: 'https://media.giphy.com/media/JIX9t2j0ZTN9S/giphy.gif',
          alt_text: 'Cat Typing',
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
          text: 'Ok. I just need to know what project this release is for?',
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
                text: 'Ilios Common',
              },
              value: 'ilios/common',
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
          text: 'Bugfix/Minor',
        },
        value: `${project}x::xminorx::x${branch}`,
      },
      {
        text: {
          type: 'plain_text',
          text: 'Feature/Patch',
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
          text: `What type of release for ${name}`,
        },
        accessory: {
          action_id: `${this.interactionType}_release_project`,
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

  async doReleaseProjectFor(owner, repo, branch, type) {
    await runTagWorkflow(owner, repo, branch, type);

    return [
      {
        type: 'section',
        text: {
          type: 'plain_text',
          emoji: true,
          text: `:white_check_mark: Done! ${type} version of ${owner}/${repo} released! :rocket:`,
        },
      },
    ];
  }
};
