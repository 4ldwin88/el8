import assert from 'node:assert/strict';
import { makeObservation } from './contracts.js';
import { canonicalizeDiscoveryObservation } from './canonical-evidence.js';
import { createMemberState } from '../../intelligence/state/member-state-contract.js';
import { createContractRef } from '../../intelligence/contracts/core.js';
import { createSafetySignal, SAFETY_LEVEL } from '../../intelligence/contracts/safety.js';
import { projectDiscoveryConcernToMemberState } from './member-state-projection.js';
import { createDiscoveryPrioritizationHandoff } from './canonical-handoff.js';

const now = '2026-01-01T00:00:00.000Z';

function refForObservation(envelope) {
  return createContractRef({ id: envelope.observationId, type: 'observation', schemaVersion: envelope.schemaVersion });
}
function refsForEvidence(items) {
  return items.map(item => createContractRef({ id: item.evidenceId, type: 'evidence', schemaVersion: item.schemaVersion }));
}

// Adversarial case 1: contradiction must remain unresolved/candidate, with both sides preserved.
{
  const supporting = canonicalizeDiscoveryObservation(makeObservation({
    id: 'obs-stress-support', questionId: 'EMO-1', timestamp: Date.parse(now),
    effects: [{ type: 'evidence', target: 'stress', polarity: 'supports', strength: .7, certainty: 'graded', sourceType: 'direct', temporality: 'current' }],
  }));
  const contradicting = canonicalizeDiscoveryObservation(makeObservation({
    id: 'obs-stress-counter', questionId: 'EMO-2', timestamp: Date.parse(now),
    effects: [{ type: 'evidence', target: 'stress', polarity: 'contradicts', strength: .7, certainty: 'graded', sourceType: 'direct', temporality: 'current' }],
  }));
  const evidence = [...supporting.evidenceRefs, ...contradicting.evidenceRefs];
  const state = createMemberState({ memberId: 'member-1', now });
  projectDiscoveryConcernToMemberState(state, {
    concernId: 'stress', resolutionState: 'narrowing', supportingEvidence: 1, contradictingEvidence: 1,
    evidenceConfidence: .5, unresolvedReasons: ['contradictory_evidence'],
    evidenceRefs: evidence.map(item => item.evidenceId),
    observationRefs: [supporting.envelope.observationId, contradicting.envelope.observationId],
  }, { now });
  assert.equal(state.concerns.stress.status, 'candidate');
  assert.equal(state.concerns.stress.sufficiency, 'insufficient');
  assert.equal(state.concerns.stress.evidenceRefs.length, 2);
  const handoff = createDiscoveryPrioritizationHandoff({
    handoffId: 'handoff-contradiction', memberStateId: 'state-1',
    observationRefs: [refForObservation(supporting.envelope), refForObservation(contradicting.envelope)],
    evidenceRefs: refsForEvidence(evidence),
    concernStates: [{ concernId: 'stress', excluded: false, resolutionState: 'narrowing' }],
  });
  assert.deepEqual(handoff.unresolvedRefs.map(ref => ref.id), ['stress']);
}

// Adversarial case 2: a safety signal must cross the same boundary without becoming evidence.
{
  const observation = canonicalizeDiscoveryObservation(makeObservation({
    id: 'obs-safety', questionId: 'SAFE-1', timestamp: Date.parse(now),
    effects: [{ type: 'safety', target: 'safety', value: 'escalate', sourceType: 'direct', temporality: 'current' }],
  }));
  assert.equal(observation.evidenceRefs.length, 0);
  const signal = createSafetySignal({ signalId: 'safety-1', level: SAFETY_LEVEL.ESCALATE, code: 'adversarial_test', sourceComponent: 'discovery', observationRefs: [refForObservation(observation.envelope)], detectedAt: now });
  const signalRef = createContractRef({ id: signal.signalId, type: 'safety_signal', schemaVersion: signal.schemaVersion });
  const handoff = createDiscoveryPrioritizationHandoff({
    handoffId: 'handoff-safety', memberStateId: 'state-2', observationRefs: [refForObservation(observation.envelope)], safetySignalRefs: [signalRef], concernStates: [],
  });
  assert.equal(handoff.resultRefs.length, 0);
  assert.deepEqual(handoff.safetySignalRefs.map(ref => ref.id), ['safety-1']);
}

// Adversarial case 3: weak evidence must not be upgraded to a sufficient/active concern by transport.
{
  const observation = canonicalizeDiscoveryObservation(makeObservation({
    id: 'obs-weak', questionId: 'PHY-1', timestamp: Date.parse(now),
    effects: [{ type: 'evidence', target: 'low_energy', polarity: 'supports', strength: .2, certainty: 'graded', sourceType: 'inferred', temporality: 'current' }],
  }));
  const state = createMemberState({ memberId: 'member-1', now });
  projectDiscoveryConcernToMemberState(state, {
    concernId: 'low_energy', resolutionState: 'narrowing', supportingEvidence: 1, contradictingEvidence: 0,
    evidenceConfidence: .2, unresolvedReasons: ['low_evidence'], evidenceRefs: observation.evidenceRefs.map(item => item.evidenceId), observationRefs: [observation.envelope.observationId],
  }, { now });
  assert.equal(state.concerns.low_energy.status, 'candidate');
  assert.equal(state.concerns.low_energy.sufficiency, 'insufficient');
  const handoff = createDiscoveryPrioritizationHandoff({ handoffId: 'handoff-weak', memberStateId: 'state-3', observationRefs: [refForObservation(observation.envelope)], evidenceRefs: refsForEvidence(observation.evidenceRefs), concernStates: [{ concernId: 'low_energy', excluded: false, resolutionState: 'narrowing' }] });
  assert.deepEqual(handoff.unresolvedRefs.map(ref => ref.id), ['low_energy']);
}

console.log('canonical Discovery adversarial tests passed');
