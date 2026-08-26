import assert from 'node:assert/strict';
import { createContractRef, createProvenance, createDecisionTrace } from './core.js';
import {
  SAFETY_LEVEL,
  createSafetySignal,
  createSafetyDisposition,
  highestSafetyLevel,
  requiresOrdinaryFlowPause,
} from './safety.js';
import { createHandoff, validateHandoff } from './handoffs.js';
import { createObservationEnvelope, createEvidenceRef } from './observations.js';

const observation = createObservationEnvelope({
  observationId: 'obs-1',
  memberId: 'member-1',
  sourceType: 'assessment',
  sourceId: 'assessment-1',
  observedAt: '2026-01-01T00:00:00.000Z',
  recordedAt: '2026-01-01T00:00:01.000Z',
});
assert.equal(observation.sourceType, 'assessment');

const correction = createObservationEnvelope({
  observationId: 'obs-2',
  memberId: 'member-1',
  sourceType: 'assessment',
  sourceId: 'assessment-1',
  supersedesObservationId: observation.observationId,
});
assert.equal(correction.supersedesObservationId, 'obs-1');

const observationRef = createContractRef({
  id: observation.observationId,
  type: 'observation',
  schemaVersion: observation.schemaVersion,
});
assert.equal(observationRef.type, 'observation');

const evidence = createEvidenceRef({
  evidenceId: 'evidence-1',
  observationId: observation.observationId,
  targetType: 'concern',
  targetId: 'money_pressure',
  polarity: 'supports',
  temporality: 'current',
});
assert.equal(evidence.observationId, 'obs-1');
assert.equal(evidence.targetId, 'money_pressure');

const memberStateRef = createContractRef({
  id: 'state-1',
  type: 'member_state',
  schemaVersion: '1.1.0',
});

const provenance = createProvenance({ sourceType: 'assessment', sourceId: 'assessment-1', observationId: 'obs-1', evidenceId: evidence.evidenceId });
assert.equal(provenance.evidenceId, 'evidence-1');

const signal = createSafetySignal({
  signalId: 'safety-1',
  level: SAFETY_LEVEL.ESCALATE,
  code: 'test_escalation',
  sourceComponent: 'discovery',
  observationRefs: [observationRef],
});
assert.equal(highestSafetyLevel([signal]), SAFETY_LEVEL.ESCALATE);

const signalRef = createContractRef({ id: signal.signalId, type: 'safety_signal', schemaVersion: signal.schemaVersion });
const disposition = createSafetyDisposition({
  dispositionId: 'disp-1',
  signalRefs: [signalRef],
  disposition: 'pause_ordinary_flow',
  rationaleCodes: ['safety_override'],
});
assert.equal(requiresOrdinaryFlowPause(disposition), true);

const handoff = createHandoff({
  handoffId: 'handoff-1',
  type: 'discovery_to_prioritization',
  memberStateRef,
  inputRefs: [observationRef],
  resultRefs: [createContractRef({ id: evidence.evidenceId, type: 'evidence', schemaVersion: evidence.schemaVersion })],
  safetySignalRefs: [signalRef],
  unresolvedRefs: [createContractRef({ id: 'money_pressure', type: 'concern', schemaVersion: '1.0.0' })],
});
assert.equal(validateHandoff(handoff).length, 0);
assert.equal(handoff.resultRefs.length, 1);
assert.equal(handoff.safetySignalRefs.length, 1);
assert.equal(handoff.unresolvedRefs.length, 1);

const trace = createDecisionTrace({
  decisionId: 'decision-1',
  component: 'safety',
  inputRefs: [observationRef],
  outputRefs: disposition.signalRefs,
  rationaleCodes: disposition.rationaleCodes,
});
assert.equal(trace.component, 'safety');
assert.equal(trace.inputRefs.length, 1);

assert.throws(() => createObservationEnvelope({ observationId: 'bad', sourceType: 'unknown', sourceId: 'x' }));
assert.throws(() => createEvidenceRef({ evidenceId: 'bad', observationId: 'obs-1', targetType: 'score', targetId: 'x', polarity: 'supports' }));
assert.throws(() => createSafetySignal({ signalId: 'bad', level: 0, code: 'bad', sourceComponent: 'discovery' }));
assert.throws(() => createSafetyDisposition({ dispositionId: 'bad', signalRefs: [], disposition: 'continue' }));
assert.throws(() => createHandoff({ handoffId: 'bad', type: 'unknown', memberStateRef }));

console.log('shared Intelligence contract tests passed');
