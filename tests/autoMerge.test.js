import test from 'node:test'
import assert from 'node:assert/strict'
import autoMerge from '../.github/scripts/auto-merge.cjs'

const ci = { name: 'build-and-test', app: { slug: 'github-actions' }, status: 'completed', conclusion: 'success' }
test('automatic merge requires successful GitHub Actions CI', () => {
  assert.equal(autoMerge.checkState([], []), 'waiting')
  assert.equal(autoMerge.checkState([{ ...ci, app: { slug: 'other' } }], []), 'waiting')
  assert.equal(autoMerge.checkState([ci], []), 'passed')
})
test('automatic merge blocks failed, cancelled, skipped, and pending checks', () => {
  for (const conclusion of ['failure', 'cancelled', 'timed_out', 'skipped', 'neutral']) {
    assert.equal(autoMerge.checkState([{ ...ci, conclusion }], []), 'failed')
  }
  assert.equal(autoMerge.checkState([ci, { status: 'in_progress' }], []), 'waiting')
  assert.equal(autoMerge.checkState([ci], [{ state: 'pending' }]), 'waiting')
  assert.equal(autoMerge.checkState([ci], [{ state: 'failure' }]), 'failed')
  assert.equal(autoMerge.checkState([ci], [{ state: 'success' }]), 'passed')
})
