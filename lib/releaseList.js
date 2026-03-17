import github from './github.js';

export const releaseList = async (owner, repo) => {
  try {
    return await github.paginate('GET /repos/:owner/:repo/releases', { owner, repo });
  } catch (e) {
    console.error(`error unable to fetch releases: ${e}`);
    return [];
  }
};
