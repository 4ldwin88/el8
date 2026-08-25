import assert from 'node:assert/strict';
import { makeObservation } from './contracts.js';
import { canonicalizeDiscoveryObservation } from './canonical-evidence.js';
import { createMemberState, validateMemberStateShape } from '../../intelligence/state/member-state-contract.js';
import { createContractRef } from '../../intelligence/contracts/core.js';
import { validateHandoff } from '../../intelligence/contracts/handoffs.js';
import { projectDiscoveryConcernToMemberState } from './member-state-projection.js';
import { createDiscoveryPrioritizationHandoff } from './canonical-handoff.js';

const now = '2026-01-01T00:00:00.000Z';
const discoveryObservation = makeObservation({
  id: 'obs-money-1',
  questionId: 'FIN-1',
  concernId: 'money_pressure',
  answerValue: 'yes',
  timestamp: Date.parse(now),
  effects: [{
    type: 'evidence',
    target: 'money_pressure',
    polarity: 'supports',
    strength: 0.8,
    certainty: 'graded',
    sourceType: 'direct',
    temporality: 'current',
  }],
});

const canonical = canonicalizeDiscoveryObservation(discoveryObservation, { memberId: 'member-1' });
assert.equal(canonical.evidenceRefs.length, 1);

const memberState = createMemberState({ memberId: 'member-1', now });
projectDiscoveryConcernToMemberState(memberState, {
  concernId: 'money_pressure',
  resolutionState: 'sufficient',
  supportingEvidence: 1,
  contradictingEvidence: 0,
  evidenceConfidence: 0.8,
  evidenceRefs: canonical.evidenceRefs.map(ref => ref.evidenceId),
  observationRefs: [canonical.envelope.observationId],
  lastObservedAt: canonical.envelope.observedAt,
}, { now });

assert.equal(validateMemberStateShape(memberState).length, 0);
assert.deepEqual(memberState.concerns.money_pressure.evidenceRefs, ['obs-money-1:evidence:0']);
assert.deepEqual(memberState.concerns.money_pressure.observationRefs, ['obs-money-1']);

const observationRef = createContractRef({ id: canonical.envelope.observationId, type: 'observation', schemaVersion: canonical.envelope.schemaVersion });
const evidenceRef = createContractRef({ id: canonical.evidenceRefs[0].evidenceId, type: 'evidence', schemaVersion: canonical.evidenceRefs[0].schemaVersion });
const handoff = createDiscoveryPrioritizationHandoff({
  handoffId: 'handoff-money-1',
  memberStateId: 'member-state-1',
  observationRefs: [observationRef],
  evidenceRefs: [evidenceRef],
  concernStates: [{ concernId: 'money_pressure', excluded: false, resolutionState: 'sufficient' }],
  createdAt: now,
});

assert.equal(validateHandoff(handoff).length, 0);
assert.equal(handoff.inputRefs[0].id, memberState.concerns.money_pressure.observationRefs[0]);
assert.equal(handoff.resultRefs[0].id, memberState.concerns.money_pressure.evidenceRefs[0]);
assert.deepEqual(handoff.unresolvedRefs, []);
assert.equal('score' in memberState.dimensions.financial, false);

console.log('canonical Discovery vertical slice tests passed');
