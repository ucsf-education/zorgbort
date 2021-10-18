const Ilios = require('./ilios.js');

module.exports = class Home extends Ilios {
  isHome = true;

  constructor(app) {
    super(app);
    this.isHome = true;
    this.interactionType = 'home';

    app.event('app_home_opened', async ({event, client}) => {
      const userQuery = await client.users.info({
        user: event.user
      });
      this.homeOpened(userQuery.user.name, event.user, client);
    });
    app.action(`${this.interactionType}_reload_home`, async ({ body, ack, client }) => {
      await ack();
      this.homeOpened(body.user.name, body.user.id, client);
    });
    app.action(`${this.interactionType}_list_releases_chooser`, async ({ body, ack, client }) => {
      await ack();
      this.listReleasesChooser(body, client);
    });
    app.action(`${this.interactionType}_list_releases_for`, async ({ body, ack, client }) => {
      await ack();
      this.listReleasesFor(body, client);
    });
    app.action(`${this.interactionType}_release_project_chooser`, async ({ body, ack, client }) => {
      await ack();
      this.releaseProjectChooser(body, client);
    });
    app.action(`${this.interactionType}_choose_release_type`, async ({ body, ack, client }) => {
      await ack();
      this.releaseTypeChooser(body, client);
    });
    app.action(`${this.interactionType}_release_project`, async ({ body, ack, client }) => {
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
    const blocks = await this.getNavigationBlocks();
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

  async listReleasesChooser(body, client) {
    const releaseChooserBlocks = await this.getReleaseChooserBlocks();
    const navigationBlocks = await this.getNavigationBlocks();
    const blocks = [...navigationBlocks, ...releaseChooserBlocks];
    
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
    const ourBlocks = await this.getProgressSpinnerBlocks(what);
    const navigationBlocks = await this.getNavigationBlocks();
    const blocks = [...navigationBlocks, ...ourBlocks];
    
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
    const ourBlocks = await this.getReleaseListBlocksFor(project, name);
    const navigationBlocks = await this.getNavigationBlocks();
    const blocks = [...navigationBlocks, ...ourBlocks];
    
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
    const ourBlocks = await this.getReleaseProjectChooserBlocks();
    const navigationBlocks = await this.getNavigationBlocks();
    const blocks = [...navigationBlocks, ...ourBlocks];
    
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
    const ourBlocks = await this.getReleaseTypeChooseBlocksFor(project, name);
    const navigationBlocks = await this.getNavigationBlocks();
    const blocks = [...navigationBlocks, ...ourBlocks];
    
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
    const { project, type, owner, repo } = this.getDetailsFromReleaseMessage(value);
    const progress = await this.showProgressSpinner(body, client, `building ${type} release for ${project}`);
    const ourBlocks = await this.doReleaseProjectFor(owner, repo, type);
    const navigationBlocks = await this.getNavigationBlocks();
    const blocks = [...navigationBlocks, ...ourBlocks];
    
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