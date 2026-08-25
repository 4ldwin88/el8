import assert from 'node:assert/strict';
import { createMemberState, validateMemberStateShape } from '../../intelligence/state/member-state-contract.js';
import { projectDiscoveryConcernToMemberState } from './member-state-projection.js';

const now = '2026-01-01T00:00:00.000Z';
const fresh = () => createMemberState({ memberId: 'test-member', now });

{
  const state = fresh();
  projectDiscoveryConcernToMemberState(state, { concernId: 'money_pressure', resolutionState: 'unresolved', supportingEvidence: 0, contradictingEvidence: 0 }, { now });
  assert.equal(state.concerns.money_pressure.status, 'unknown');
  assert.equal(state.concerns.money_pressure.sufficiency, 'insufficient');
}

{
  const state = fresh();
  projectDiscoveryConcernToMemberState(state, { concernId: 'stress', resolutionState: 'narrowing', supportingEvidence: 1, contradictingEvidence: 1, evidenceConfidence: 0.35, unresolvedReasons: ['mixed_evidence'], evidenceRefs: ['ev-1', 'ev-2'], observationRefs: ['obs-1'] }, { now });
  assert.equal(state.concerns.stress.status, 'candidate');
  assert.equal(state.concerns.stress.sufficiency, 'insufficient');
  assert.equal(state.concerns.stress.evidenceConfidence, 0.35);
  assert.deepEqual(state.concerns.stress.unresolvedReasons, ['mixed_evidence']);
}

{
  const state = fresh();
  projectDiscoveryConcernToMemberState(state, { concernId: 'poor_sleep', resolutionState: 'sufficient', supportingEvidence: 3, contradictingEvidence: 0, evidenceConfidence: 0.82, evidenceRefs: ['ev-1'], observationRefs: ['obs-1'] }, { now });
  assert.equal(state.concerns.poor_sleep.status, 'active');
  assert.equal(state.concerns.poor_sleep.sufficiency, 'sufficient');
  assert.equal('score' in state.dimensions.physical, false);
}

{
  const state = fresh();
  projectDiscoveryConcernToMemberState(state, { concernId: 'low_support', excluded: true, resolutionState: 'nonIssue', contradictingEvidence: 2, evidenceConfidence: 1, evidenceRefs: ['ev-no-issue'] }, { now });
  assert.equal(state.concerns.low_support.status, 'excluded');
  assert.equal(state.concerns.low_support.sufficiency, 'sufficient');
  assert.deepEqual(state.concerns.low_support.evidenceRefs, ['ev-no-issue']);
}

{
  const state = fresh();
  projectDiscoveryConcernToMemberState(state, { concernId: 'work_instability', resolutionState: 'sufficient', supportingEvidence: 1, evidenceConfidence: 4 }, { now });
  assert.equal(state.concerns.work_instability.evidenceConfidence, 1);
  assert.equal(state.revision, 1);
  assert.equal(validateMemberStateShape(state).length, 0);
}

assert.throws(() => projectDiscoveryConcernToMemberState(fresh(), { concernId: 'not_canonical' }, { now }), /Unknown canonical concernId/);
console.log('member state projection tests passed');
