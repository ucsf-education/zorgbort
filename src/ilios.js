const { releaseList } = require('../lib/releaseList');
const { runTagWorkflow } = require('../lib/runTagWorkflow');

module.exports = class Home {
  isHome = false;
  interactionType = null;

  async getNavigationBlocks() {
    const elements = [
      {
        "type": "button",
        "text": {
          "type": "plain_text",
          "text": "List Releases",
          "emoji": true
        },
        "action_id": `${this.interactionType}_list_releases_chooser`
      },
      {
        "type": "button",
        "text": {
          "type": "plain_text",
          "text": "Release Project",
          "emoji": true
        },
        "action_id": `${this.interactionType}_release_project_chooser`
      }
    ];
    if (this.isHome) {
      elements.unshift({
        "type": "button",
        "text": {
          "type": "plain_text",
          "text": "Home",
          "emoji": true
        },
        "style": "primary",
        "action_id": `${this.interactionType}_reload_home`
      });
    }
    return [
      {
        "type": "divider"
      },
      {
        "type": "actions",
        elements
      },
      {
        "type": "divider"
      },
    ];
  }

  async getReleaseChooserBlocks() {
    return [
      {
        "type": "section",
        "text": {
          "type": "mrkdwn",
          "text": "What project would you like releases for?"
        },
        "accessory": {
          "action_id": `${this.interactionType}_list_releases_for`,
          "type": "static_select",
          "placeholder": {
            "type": "plain_text",
            "text": "Ilios Projects"
          },
          "options": [
            {
              "text": {
                "type": "plain_text",
                "text": "Frontend"
              },
              "value": "frontend"
            },
            {
              "text": {
                "type": "plain_text",
                "text": "Common"
              },
              "value": "common"
            },
          ]
        }
      }
    ]
  }

  async getProgressSpinnerBlocks(what) {
    return [
      {
        "type": "section",
        "text": {
          "type": "mrkdwn",
          "text": `Woking on ${what}....`,
        },
        "accessory": {
          type: 'image',
          image_url: 'https://media.giphy.com/media/JIX9t2j0ZTN9S/giphy.gif',
          alt_text: 'Cat Typing'
        }
      }
    ]
  }

  async getReleaseListBlocksFor(project, name) {
    const releases = await releaseList('ilios', project);

    let list = releases.join("\n * ");
    if (list.length > 2999) {
      list = list.substr(0, 2000) + "\n\n *List Truncated at Maximum Length*";
    }
    
    return [
      {
        "type": "section",
        "text": {
          "type": "mrkdwn",
          "text": `Releases For ${name}:\n * ` + list,
        }
      }
    ]
  }

  async getReleaseProjectChooserBlocks() {
    return [
      {
        "type": "section",
        "text": {
          "type": "mrkdwn",
          "text": "What project would you like releases for?"
        },
        "accessory": {
          "action_id": `${this.interactionType}_choose_release_type`,
          "type": "static_select",
          "placeholder": {
            "type": "plain_text",
            "text": "Ilios Projects"
          },
          "options": [
            {
              "text": {
                "type": "plain_text",
                "text": "Test Release Workspace"
              },
              "value": "jrjohnson/test-release-workspace"
            },
          ]
        }
      }
    ]
  }

  async getReleaseTypeChooseBlocksFor(project, name) {
    return [
      {
        "type": "section",
        "text": {
          "type": "mrkdwn",
          "text": `What type of release for ${name}`,
        },
        "accessory": {
          "action_id": `${this.interactionType}_release_project`,
          "type": "static_select",
          "placeholder": {
            "type": "plain_text",
            "text": "Release Type"
          },
          "options": [
            {
              "text": {
                "type": "plain_text",
                "text": "Major"
              },
              "value": `${project}x::xmajor`
            },
            {
              "text": {
                "type": "plain_text",
                "text": "Minor"
              },
              "value": `${project}x::xminor`
            },
            {
              "text": {
                "type": "plain_text",
                "text": "Patch"
              },
              "value": `${project}x::xpatch`
            },
          ]
        }
      }
    ]
  }

  getDetailsFromReleaseMessage(str) {
    const [project, type] = str.split('x::x');
    const [owner, repo] = project.split('/');

    return { project, type, owner, repo };
  }

  async doReleaseProjectFor(owner, repo, type) {
    await runTagWorkflow(owner, repo, type);
    
    return [
      {
        "type": "section",
        "text": {
          "type": "mrkdwn",
          "text": "Done!",
        }
      }
    ]
  }
}