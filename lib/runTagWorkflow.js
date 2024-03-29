'use strict';

const github = require('./github.js');

exports.runTagWorkflow = async (owner, repo, branch, releaseType) => {
  try {
    return github.rest.actions.createWorkflowDispatch({
      owner,
      repo,
      workflow_id: 'tag_version.yaml',
      ref: branch,
      inputs: {
        releaseType,
      },
    });
  } catch (e) {
    console.error(`error unable to run tag workflow: ${e}`);
    return [];
  }
};
