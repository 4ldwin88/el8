import assert from 'node:assert/strict';
import { createContractRef, createProvenance, createDecisionTrace } from './core.js';
import {
  SAFETY_LEVEL,
  createSafetySignal,
  createSafetyDisposition,
  highestSafetyLevel,
  requiresOrdinaryFlowPause,
} from './safety.js';

const observationRef = createContractRef({
  id: 'obs-1',
  type: 'observation',
  schemaVersion: '1.0.0',
});
assert.equal(observationRef.type, 'observation');

const provenance = createProvenance({ sourceType: 'assessment', sourceId: 'assessment-1', observationId: 'obs-1' });
assert.equal(provenance.observationId, 'obs-1');

const signal = createSafetySignal({
  signalId: 'safety-1',
  level: SAFETY_LEVEL.ESCALATE,
  code: 'test_escalation',
  sourceComponent: 'discovery',
  observationRefs: [observationRef],
});
assert.equal(highestSafetyLevel([signal]), SAFETY_LEVEL.ESCALATE);

const disposition = createSafetyDisposition({
  dispositionId: 'disp-1',
  signalRefs: [createContractRef({ id: signal.signalId, type: 'safety_signal', schemaVersion: signal.schemaVersion })],
  disposition: 'pause_ordinary_flow',
  rationaleCodes: ['safety_override'],
});
assert.equal(requiresOrdinaryFlowPause(disposition), true);

const trace = createDecisionTrace({
  decisionId: 'decision-1',
  component: 'safety',
  inputRefs: [observationRef],
  outputRefs: disposition.signalRefs,
  rationaleCodes: disposition.rationaleCodes,
});
assert.equal(trace.component, 'safety');
assert.equal(trace.inputRefs.length, 1);

assert.throws(() => createSafetySignal({ signalId: 'bad', level: 0, code: 'bad', sourceComponent: 'discovery' }));
assert.throws(() => createSafetyDisposition({ dispositionId: 'bad', signalRefs: [], disposition: 'continue' }));

console.log('shared Intelligence contract tests passed');
