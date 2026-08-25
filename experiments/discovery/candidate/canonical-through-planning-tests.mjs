import assert from 'node:assert/strict';
import { makeObservation } from './contracts.js';
import { canonicalizeDiscoveryObservation } from './canonical-evidence.js';
import { createMemberState } from '../../intelligence/state/member-state-contract.js';
import { projectDiscoveryConcernToMemberState } from './member-state-projection.js';
import { prioritizeMemberState } from '../../intelligence/prioritization/prioritization.js';
import { createPlanFromPriorities } from '../../intelligence/planning/planning.js';

const now = '2026-01-01T00:00:00.000Z';

function canonicalConcern({ observationId, questionId, concernId, strength, resolutionState, confidence }) {
  const canonical = canonicalizeDiscoveryObservation(makeObservation({
    id: observationId,
    questionId,
    concernId,
    answerValue: 'yes',
    timestamp: Date.parse(now),
    effects: [{ type: 'evidence', target: concernId, polarity: 'supports', strength, certainty: 'graded', sourceType: 'direct', temporality: 'current' }],
  }), { memberId: 'member-1' });

  const state = createMemberState({ memberId: 'member-1', now });
  projectDiscoveryConcernToMemberState(state, {
    concernId,
    resolutionState,
    supportingEvidence: 1,
    contradictingEvidence: 0,
    evidenceConfidence: confidence,
    evidenceRefs: canonical.evidenceRefs.map(item => item.evidenceId),
    observationRefs: [canonical.envelope.observationId],
    lastObservedAt: canonical.envelope.observedAt,
  }, { now });
  return { canonical, state };
}

// Supported concern reaches Planning with provenance intact.
{
  const { canonical, state } = canonicalConcern({ observationId: 'obs-money', questionId: 'FIN-1', concernId: 'money_pressure', strength: .8, resolutionState: 'sufficient', confidence: .8 });
  const priorities = prioritizeMemberState(state, { now });
  const plan = createPlanFromPriorities(priorities, { now });
  assert.equal(plan.planItems.length, 1);
  assert.equal(plan.planItems[0].concernId, 'money_pressure');
  assert.equal(plan.planItems[0].evidenceRefs[0], canonical.evidenceRefs[0].evidenceId);
  assert.equal(plan.planItems[0].observationRefs[0], canonical.envelope.observationId);
  assert.equal('score' in plan.planItems[0], false);
}

// Weak/unresolved concern reaches Prioritization but cannot silently become a plan item.
{
  const { state } = canonicalConcern({ observationId: 'obs-energy', questionId: 'PHY-1', concernId: 'low_energy', strength: .2, resolutionState: 'narrowing', confidence: .2 });
  const priorities = prioritizeMemberState(state, { now });
  const plan = createPlanFromPriorities(priorities, { now });
  assert.equal(priorities.priorityItems.length, 1);
  assert.deepEqual(priorities.unresolvedConcernIds, ['low_energy']);
  assert.deepEqual(plan.planItems, []);
  assert.deepEqual(plan.unresolvedConcernIds, ['low_energy']);
}

// Safety blocks both Prioritization and Planning ordinary flow.
{
  const { state } = canonicalConcern({ observationId: 'obs-stress', questionId: 'EMO-1', concernId: 'stress', strength: .9, resolutionState: 'sufficient', confidence: .9 });
  const safetyDisposition = { disposition: 'pause_ordinary_flow' };
  const priorities = prioritizeMemberState(state, { safetyDisposition, now });
  const plan = createPlanFromPriorities(priorities, { now });
  assert.equal(priorities.blockedBySafety, true);
  assert.equal(plan.blockedBySafety, true);
  assert.deepEqual(priorities.priorityItems, []);
  assert.deepEqual(plan.planItems, []);
}

console.log('canonical slice through Planning tests passed');
