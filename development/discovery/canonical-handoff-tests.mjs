import assert from 'node:assert/strict';
import { createContractRef } from '../../intelligence/contracts/core.js';
import { validateHandoff } from '../../intelligence/contracts/handoffs.js';
import { MEMBER_STATE_SCHEMA_VERSION } from '../../intelligence/state/member-state-contract.js';
import { createDiscoveryPrioritizationHandoff } from './canonical-handoff.js';

const observationRef = createContractRef({ id: 'obs-1', type: 'observation', schemaVersion: '1.0.0' });
const evidenceRef = createContractRef({ id: 'evidence-1', type: 'evidence', schemaVersion: '1.0.0' });
const safetyRef = createContractRef({ id: 'safety-1', type: 'safety_signal', schemaVersion: '1.0.0' });

const handoff = createDiscoveryPrioritizationHandoff({
  handoffId: 'discovery-handoff-1',
  memberStateId: 'member-state-1',
  observationRefs: [observationRef],
  evidenceRefs: [evidenceRef],
  safetySignalRefs: [safetyRef],
  concernStates: [
    { concernId: 'money_pressure', excluded: false, resolutionState: 'narrowing', evidenceConfidence: 0.72 },
    { concernId: 'sleep_disruption', excluded: true, resolutionState: 'nonIssue', evidenceConfidence: 0 },
  ],
});

assert.equal(validateHandoff(handoff).length, 0);
assert.equal(handoff.type, 'discovery_to_prioritization');
assert.equal(handoff.memberStateRef.schemaVersion, MEMBER_STATE_SCHEMA_VERSION);
assert.deepEqual(handoff.inputRefs, [observationRef]);
assert.deepEqual(handoff.resultRefs, [evidenceRef]);
assert.deepEqual(handoff.safetySignalRefs, [safetyRef]);
assert.deepEqual(handoff.unresolvedRefs.map(ref => ref.id), ['money_pressure']);
assert.equal('evidenceConfidence' in handoff, false, 'private Discovery confidence must not leak into shared handoff');

const sufficient = createDiscoveryPrioritizationHandoff({
  handoffId: 'discovery-handoff-2',
  memberStateId: 'member-state-1',
  concernStates: [{ concernId: 'money_pressure', excluded: false, resolutionState: 'sufficient', evidenceConfidence: 1 }],
});
assert.deepEqual(sufficient.unresolvedRefs, []);

assert.throws(() => createDiscoveryPrioritizationHandoff({ handoffId: 'bad' }), /memberStateId is required/);

console.log('canonical Discovery handoff tests passed');
