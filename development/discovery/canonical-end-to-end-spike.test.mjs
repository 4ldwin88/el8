import assert from 'node:assert/strict';
import { makeObservation } from './contracts.js';
import { canonicalizeDiscoveryObservation } from './canonical-evidence.js';
import { createMemberState } from '../../intelligence/state/member-state-contract.js';
import { projectDiscoveryConcernToMemberState } from './member-state-projection.js';
import { prioritizeMemberState } from '../../intelligence/prioritization/prioritization.js';
import { createPlanFromPriorities } from '../../intelligence/planning/planning.js';
import { createInterventionCandidates } from '../../intelligence/interventions/interventions.js';
import { createOutcome } from '../../intelligence/outcomes/outcomes.js';

const now = '2026-01-01T00:00:00.000Z';

const observation = makeObservation({
  id: 'obs-money-start', questionId: 'FIN-1', concernId: 'money_pressure', answerValue: 'yes', timestamp: Date.parse(now),
  effects: [{ type: 'evidence', target: 'money_pressure', polarity: 'supports', strength: .85, certainty: 'graded', sourceType: 'direct', temporality: 'current' }],
});
const canonical = canonicalizeDiscoveryObservation(observation, { memberId: 'member-1' });
const state = createMemberState({ memberId: 'member-1', now });
projectDiscoveryConcernToMemberState(state, {
  concernId: 'money_pressure', resolutionState: 'sufficient', supportingEvidence: 1, contradictingEvidence: 0, evidenceConfidence: .85,
  evidenceRefs: canonical.evidenceRefs.map(item => item.evidenceId), observationRefs: [canonical.envelope.observationId], lastObservedAt: canonical.envelope.observedAt,
}, { now });

const priorities = prioritizeMemberState(state, { now });
const plan = createPlanFromPriorities(priorities, { now });
const interventions = createInterventionCandidates(plan, { now });
assert.equal(interventions.interventionCandidates.length, 1);
const intervention = interventions.interventionCandidates[0];
assert.equal(intervention.concernId, 'money_pressure');
assert.deepEqual(intervention.evidenceRefs, canonical.evidenceRefs.map(item => item.evidenceId));
assert.deepEqual(intervention.observationRefs, [canonical.envelope.observationId]);

// The outcome records what happened; it does not secretly rewrite Member State.
const revisionBeforeOutcome = state.revision;
const outcome = createOutcome({
  outcomeId: 'outcome-money-1', interventionId: intervention.interventionId, concernId: intervention.concernId,
  status: 'completed', observationRefs: ['obs-money-followup'], evidenceRefs: ['ev-money-followup'], recordedAt: now,
});
assert.equal(outcome.interventionId, 'intervention:money_pressure');
assert.equal(outcome.concernId, 'money_pressure');
assert.equal(outcome.status, 'completed');
assert.equal(state.revision, revisionBeforeOutcome, 'Outcome creation must not mutate Member State');
assert.equal('score' in outcome, false);

// Safety still prevents the ordinary downstream chain from producing an intervention.
const blockedPriorities = prioritizeMemberState(state, { safetyDisposition: { disposition: 'pause_ordinary_flow' }, now });
const blockedPlan = createPlanFromPriorities(blockedPriorities, { now });
const blockedInterventions = createInterventionCandidates(blockedPlan, { now });
assert.equal(blockedInterventions.blockedBySafety, true);
assert.deepEqual(blockedInterventions.interventionCandidates, []);

console.log('canonical Observation-to-Outcome spike passed');
