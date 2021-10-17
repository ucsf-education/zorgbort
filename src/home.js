const { releaseList } = require('../lib/releaseList');
const { runTagWorkflow } = require('../lib/runTagWorkflow');

module.exports = class Home {
  homeView = null;

  constructor(app) {
    app.event('app_home_opened', async ({event, client}) => {
      const userQuery = await client.users.info({
        user: event.user
      });
      this.homeOpened(userQuery.user.name, event.user, client);
    });
    app.action('list_releases_chooser', async ({ body, ack, client }) => {
      await ack();
      this.listReleasesChooser(body, client);
    });
    app.action('list_releases_for', async ({ body, ack, client }) => {
      await ack();
      this.listReleasesFor(body, client);
    });
    app.action('reload_home', async ({ body, ack, client }) => {
      await ack();
      this.homeOpened(body.user.name, body.user.id, client);
    });
    app.action('release_project_chooser', async ({ body, ack, client }) => {
      await ack();
      this.releaseProjectChooser(body, client);
    });
    app.action('choose_release_type', async ({ body, ack, client }) => {
      await ack();
      this.releaseTypeChooser(body, client);
    });
    app.action('release_project', async ({ body, ack, client }) => {
      await ack();
      this.releaseProject(body, client);
    });
  }

  async homeOpened(username, userId, client) {
    /* view.publish is the method that your app uses to push a view to the Home tab */
    this.homeView = await client.views.publish({
      /* the user that opened your app's app home */
      user_id: userId,
      /* the view object that appears in the app home*/
      view: await this.getDefaultHome(username)
    });
  }

  async getDefaultHome(username) {
    const blocks = await this.getDefaultBlocks();
    blocks.unshift(await this.getWelcomeBlock(username))
    return  {
      type: 'home',
      callback_id: 'home_view',
      blocks,
    }
  }

  async getWelcomeBlock(username) {
    return {
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": `Hi ${username}! Ready to do something awesome together?`
      }
    };
  }

  async getDefaultBlocks() {
    return [
      {
        "type": "divider"
      },
      {
        "type": "actions",
        "elements": [
          {
            "type": "button",
            "text": {
              "type": "plain_text",
              "text": "Home",
              "emoji": true
            },
            "style": "primary",
            "action_id": "reload_home"
          },
          {
            "type": "button",
            "text": {
              "type": "plain_text",
              "text": "List Releases",
              "emoji": true
            },
            "action_id": "list_releases_chooser"
          },
          {
            "type": "button",
            "text": {
              "type": "plain_text",
              "text": "Release Project",
              "emoji": true
            },
            "action_id": "release_project_chooser"
          }
        ]
      },
      {
        "type": "divider"
      },
    ];
  }

  async listReleasesChooser(body, client) {
    const blocks = await this.getDefaultBlocks();
    blocks.push({
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": "What project would you like releases for?"
      },
      "accessory": {
        "action_id": "list_releases_for",
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
    });
    
    await client.views.update({
      view_id: body.view.id,
      hash: body.view.hash,
      view: {
        type: 'home',
        // View identifier
        callback_id: 'home_view',
        title: {
          type: 'plain_text',
          text: 'List Releases'
        },
        blocks
      }
    });
  }

  async showProgressSpinner(body, client, what) {
    const blocks = await this.getDefaultBlocks();
    blocks.push({
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
    });
    
    return await client.views.update({
      view_id: body.view.id,
      hash: body.view.hash,
      view: {
        type: 'home',
        // View identifier
        callback_id: 'home_view',
        blocks
      }
    });
  }

  async listReleasesFor(body, client) {
    const project = body.actions[0]["selected_option"].value;
    const name = body.actions[0]["selected_option"].text.text;
    const progress = await this.showProgressSpinner(body, client, `releases for *${name}*`);
    const releases = await releaseList('ilios', project);

    let list = releases.join("\n * ");
    if (list.length > 2999) {
      list = list.substr(0, 2000) + "\n\n *List Truncated at Maximum Length*";
    }
    
    const blocks = await this.getDefaultBlocks();
    blocks.push({
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": `Releases For ${name}:\n * ` + list,
      }
    });
    
    await client.views.update({
      view_id: progress.view.id,
      hash: progress.view.hash,
      view: {
        type: 'home',
        // View identifier
        callback_id: 'home_view',
        blocks
      }
    });
  }

  async releaseProjectChooser(body, client) {
    const blocks = await this.getDefaultBlocks();
    blocks.push({
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": "What project would you like releases for?"
      },
      "accessory": {
        "action_id": "choose_release_type",
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
    });
    
    await client.views.update({
      view_id: body.view.id,
      hash: body.view.hash,
      view: {
        type: 'home',
        // View identifier
        callback_id: 'home_view',
        title: {
          type: 'plain_text',
          text: 'Release For'
        },
        blocks
      }
    });
  }

  async releaseTypeChooser(body, client) {
    const project = body.actions[0]["selected_option"].value;
    const name = body.actions[0]["selected_option"].text.text;
    const blocks = await this.getDefaultBlocks();
    blocks.push({
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": `What type of release for ${name}`,
      },
      "accessory": {
        "action_id": "release_project",
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
    });
    
    await client.views.update({
      view_id: body.view.id,
      hash: body.view.hash,
      view: {
        type: 'home',
        // View identifier
        callback_id: 'home_view',
        title: {
          type: 'plain_text',
          text: 'Release Type'
        },
        blocks
      }
    });
  }

  async releaseProject(body, client) {
    const { value } = body.actions[0]["selected_option"];
    const [project, type] = value.split('x::x');
    const [owner, repo] = project.split('/');
    const progress = await this.showProgressSpinner(body, client, `building ${type} release for ${project}`);

    await runTagWorkflow(owner, repo, type);
    console.log('victory', result);
    
    const blocks = await this.getDefaultBlocks();
    blocks.push({
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": "Done!",
      }
    });
    
    await client.views.update({
      view_id: progress.view.id,
      hash: progress.view.hash,
      view: {
        type: 'home',
        // View identifier
        callback_id: 'home_view',
        blocks
      }
    });
  }
}