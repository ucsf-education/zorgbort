const Ilios = require('./ilios.js');

module.exports = class Conversation extends Ilios {
  constructor(app) {
    super(app);
    this.interactionType = 'conversation';
    app.message(/^latest release/, async ({ say, body, context }) => {
      this.setDone(context);
      await this.validateUser(say, body.event.user);
      const blocks = await this.getReleaseChooserBlocks(true);
      await say({ blocks });
    });
    app.message(/^list releases/, async ({ say, body, context }) => {
      this.setDone(context);
      await this.validateUser(say, body.event.user);
      const blocks = await this.getReleaseChooserBlocks();
      await say({ blocks });
    });
    app.message(/^release/, async ({ say, body, context }) => {
      this.setDone(context);
      await this.validateUser(say, body.event.user);
      await this.releaseProjectChooser(say);
    });
    app.event('app_mention', async ({ event, say, context }) => {
      console.log(event);
      if (event.text.startsWith('latest release') || event.text.endsWith('latest release')) {
        this.setDone(context);
        await this.validateUser(say, event.user);
        const blocks = await this.getReleaseChooserBlocks(true);
        await say({ blocks });
      } else if (event.text.startsWith('list releases') || event.text.endsWith('list releases')) {
        this.setDone(context);
        await this.validateUser(say, event.user);
        const blocks = await this.getReleaseChooserBlocks();
        await say({ blocks });
      } else if (event.text.startsWith('release') || event.text.endsWith('release')) {
        this.setDone(context);
        await this.validateUser(say, event.user);
        await this.releaseProjectChooser(say);
      } else {
        this.setDone(context);
        await this.sendMenu(event.user, say);
      }
    });
    app.action(`${this.interactionType}_latest_release_chooser`, async ({ ack, body, respond }) => {
      await ack();
      await this.validateUser(respond, body.user.id);
      const blocks = await this.getReleaseChooserBlocks(true);
      await respond({ blocks, replace_original: true });
    });
    app.action(
      `${this.interactionType}_latest_release_for`,
      async ({ action, ack, body, respond }) => {
        await ack();
        await this.validateUser(respond, body.user.id);
        await this.latestReleaseFor(action, respond);
      },
    );
    app.action(`${this.interactionType}_list_releases_chooser`, async ({ ack, body, respond }) => {
      await ack();
      await this.validateUser(respond, body.user.id);
      const blocks = await this.getReleaseChooserBlocks();
      await respond({ blocks, replace_original: true });
    });
    app.action(
      `${this.interactionType}_list_releases_for`,
      async ({ action, ack, body, respond }) => {
        await ack();
        await this.validateUser(respond, body.user.id);
        await this.listReleasesFor(action, respond);
      },
    );
    app.action(
      `${this.interactionType}_release_project_chooser`,
      async ({ ack, body, respond }) => {
        await ack();
        await this.validateUser(respond, body.user.id);
        await this.releaseProjectChooser(respond);
      },
    );
    app.action(
      `${this.interactionType}_choose_release_type`,
      async ({ action, ack, body, respond }) => {
        await ack();
        await this.validateUser(respond, body.user.id);
        await this.releaseTypeChooser(action, respond);
      },
    );
    app.action(
      `${this.interactionType}_confirm_release`,
      async ({ action, ack, body, respond }) => {
        await ack();
        await this.validateUser(respond, body.user.id);
        await this.confirmRelease(action, respond);
      },
    );
    app.action(`${this.interactionType}_cancel`, async ({ action, ack, body, respond }) => {
      await ack();
      await this.validateUser(respond, body.user.id);
      await this.cancel(action, respond);
    });
    app.action(
      `${this.interactionType}_release_project`,
      async ({ action, ack, body, respond }) => {
        await ack();
        await this.validateUser(respond, body.user.id);
        await this.releaseProject(action, respond);
      },
    );
    app.use(async ({ body, next, say, context }) => {
      await next();
      if (
        body.event &&
        body.event.type === 'message' &&
        !body.event.subtype &&
        !this.isDone(context)
      ) {
        await this.sendMenu(body.event.user, say);
      }
    });
  }

  setDone(context) {
    context.done = true;
  }

  isDone(context) {
    return context.done == true;
  }

  async sendMenu(userId, say) {
    await this.validateUser(say, userId);
    const navigationBlocks = await this.getNavigationBlocks();
    const blocks = [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: 'What can I help you with?',
        },
      },
      ...navigationBlocks,
    ];
    await say({
      text: {
        type: 'mrkdwn',
        text: `Welcome message and options`,
      },
      blocks,
    });
  }

  async validateUser(respond, userId) {
    if (!this.isUserValid(userId)) {
      await respond("I'm sorry, you're not authorized for this application.");
      throw new Error(`${userId} isn't in VALID_RELEASE_USERS.`);
    }
  }

  async showProgressSpinner(respond, what) {
    const blocks = await this.getProgressSpinnerBlocks(what);
    await respond({ blocks, replace_original: true });
  }

  async listReleasesFor(action, respond) {
    const project = action.selected_option.value;
    const name = action.selected_option.text.text;
    await this.showProgressSpinner(respond, `releases for *${name}*`);
    const blocks = await this.getReleaseListBlocksFor(project, name);

    await respond({ blocks, replace_original: true });
  }

  async latestReleaseFor(action, respond) {
    const project = action.selected_option.value;
    const name = action.selected_option.text.text;
    await this.showProgressSpinner(respond, `latest release for *${name}*`);
    const blocks = await this.getReleaseLatestBlocksFor(project, name);

    await respond({ blocks, replace_original: true });
  }

  async releaseProjectChooser(respond) {
    const blocks = await this.getReleaseProjectChooserBlocks();
    await respond({ blocks, replace_original: true });
  }

  async releaseTypeChooser(action, respond) {
    const project = action.selected_option.value;
    const name = action.selected_option.text.text;
    const blocks = await this.getReleaseTypeChooseBlocksFor(project, name);
    await respond({ blocks, replace_original: true });
  }

  async confirmRelease(action, respond) {
    const { value } = action.selected_option;
    const { project, type, branch } = this.getDetailsFromReleaseMessage(value);
    const blocks = await this.getReleaseConfirmationBlocksFor(project, branch, type);
    await respond({ blocks, replace_original: true });
  }

  async cancel({ value }, respond) {
    const { project, type } = this.getDetailsFromReleaseMessage(value);
    const blocks = await this.getCancelBlock(project, type);
    await respond({ blocks, replace_original: true });
  }

  async releaseProject({ value }, respond) {
    const { project, type, owner, branch, repo } = this.getDetailsFromReleaseMessage(value);
    await this.showProgressSpinner(respond, `building *_${type}_* release for \`${project}\``);
    const blocks = await this.doReleaseProjectFor(owner, repo, branch, type);
    await respond({ blocks, replace_original: true });
  }
};
