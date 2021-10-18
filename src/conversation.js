const Ilios = require('./ilios.js');

module.exports = class Conversation extends Ilios {
  constructor(app) {
    super(app);
    this.interactionType = 'conversation';
    app.message(/.*/, async ({ say }) => {
      const blocks = await this.getNavigationBlocks();
      await say({
        blocks,
      });
    });
    app.action(`${this.interactionType}_list_releases_chooser`, async ({ ack, respond }) => {
      await ack();
      const blocks = await this.getReleaseChooserBlocks();
      await respond({ blocks, replace_original: true });
    });
    app.action(`${this.interactionType}_list_releases_for`, async ({ action, ack, respond }) => {
      await ack();
      await this.listReleasesFor(action, respond);
    });
    app.action(`${this.interactionType}_release_project_chooser`, async ({ action, ack, respond }) => {
      await ack();
      await this.releaseProjectChooser(action, respond);
    });
    app.action(`${this.interactionType}_choose_release_type`, async ({ action, ack, respond }) => {
      await ack();
      await this.releaseTypeChooser(action, respond);
    });
    app.action(`${this.interactionType}_release_project`, async ({ action, ack, respond }) => {
      await ack();
      await this.releaseProject(action, respond);
    });
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

  async releaseProjectChooser(action, respond) {
    const blocks = await this.getReleaseProjectChooserBlocks();
    await respond({ blocks, replace_original: true });
  }

  async releaseTypeChooser(action, respond) {
    const project = action.selected_option.value;
    const name = action.selected_option.text.text;
    const blocks = await this.getReleaseTypeChooseBlocksFor(project, name);
    await respond({ blocks, replace_original: true });
  }

  async releaseProject(action, respond) {
    const { value } = action.selected_option;
    const { project, type, owner, repo } = this.getDetailsFromReleaseMessage(value);
    const progress = await this.showProgressSpinner(respond, `building ${type} release for ${project}`);
    const blocks = await this.doReleaseProjectFor(owner, repo, type);
    await respond({ blocks, replace_original: true });
  }
}