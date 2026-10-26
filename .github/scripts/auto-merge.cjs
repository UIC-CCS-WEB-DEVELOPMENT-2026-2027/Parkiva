// GitHub enforces required checks, up-to-date branches, and protections again
// at merge time. The expected SHA also prevents merging a new untested push.
function checkState(checks, statuses) {
  const ci = checks.find(check => check.name === 'build-and-test' && check.app?.slug === 'github-actions');
  const failed = checks.some(check => check.status === 'completed' && check.conclusion !== 'success') ||
    statuses.some(status => ['error', 'failure'].includes(status.state));
  if (failed) return 'failed';
  if (!ci || ci.status !== 'completed' || ci.conclusion !== 'success') return 'waiting';
  if (checks.some(check => check.status !== 'completed') || statuses.some(status => status.state !== 'success')) return 'waiting';
  return 'passed';
}

module.exports = async function run({ github, context, core }) {
  const repo = context.repo;
  const settings = (await github.rest.repos.get(repo)).data;
  if (!settings.allow_auto_merge) throw new Error('Repository automatic merging is disabled.');
  const protection = (await github.rest.repos.getBranchProtection({ ...repo, branch: 'main' })).data;
  if (!protection.enforce_admins?.enabled || !protection.required_status_checks?.strict ||
      !protection.required_status_checks.contexts.includes('build-and-test')) {
    throw new Error('Required Parkiva CI branch protection is missing; refusing to merge.');
  }
  const prs = await github.paginate(github.rest.pulls.list, { ...repo, state: 'open', base: 'main', per_page: 100 });
  // Oldest PR first; the Codex queue permits only one issue PR at a time.
  for (const candidate of prs.reverse()) {
    if (candidate.draft || candidate.head.repo?.full_name !== settings.full_name ||
        !/^(feature\/|codex\/issue-)/.test(candidate.head.ref)) continue;
    const pr = (await github.rest.pulls.get({ ...repo, pull_number: candidate.number })).data;
    if (pr.mergeable !== true || pr.mergeable_state !== 'clean') {
      core.info(`PR #${pr.number}: waiting for a conflict-free, protected, up-to-date head.`);
      continue;
    }
    const checks = await github.paginate(github.rest.checks.listForRef, { ...repo, ref: pr.head.sha, filter: 'latest', per_page: 100 });
    const combined = (await github.rest.repos.getCombinedStatusForRef({ ...repo, ref: pr.head.sha, per_page: 100 })).data;
    if (combined.total_count > combined.statuses.length) throw new Error('Status response is incomplete; refusing to merge.');
    const statuses = combined.statuses;
    const state = checkState(checks, statuses);
    if (state === 'failed') throw new Error(`PR #${pr.number}: a check failed; no merge performed.`);
    if (state !== 'passed') { core.info(`PR #${pr.number}: checks pending.`); continue; }
    const result = await github.rest.pulls.merge({ ...repo, pull_number: pr.number, sha: pr.head.sha, merge_method: 'squash' });
    if (!result.data.merged) throw new Error(`PR #${pr.number}: GitHub refused the protected merge.`);
    core.notice(`Merged PR #${pr.number} at ${result.data.sha}`);
    break;
  }
};
module.exports.checkState = checkState;
