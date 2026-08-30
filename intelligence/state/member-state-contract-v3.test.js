import assert from 'node:assert/strict';
import {
  MEMBER_STATE_SCHEMA_VERSION,
  createMemberState,
  createConstructState,
  createFact,
  createFocusDecision,
  validateMemberStateShape,
} from './member-state-contract.js';

const state = createMemberState({ memberId: 'T0001', now: '2026-08-30T00:00:00Z' });
assert.equal(state.schemaVersion, MEMBER_STATE_SCHEMA_VERSION);
assert.equal(state.memberContext.capacity, 'unknown');
assert.equal(state.memberContext.readiness, 'unknown');
assert.equal(state.plan, undefined);
assert.equal(state.activePriorities, undefined);
assert.deepEqual(validateMemberStateShape(state), []);

const financial = createConstructState({ constructId: 'FINANCIAL_STRAIN' });
assert.equal(financial.evidenceConfidence, 'unknown');
state.constructs.FINANCIAL_STRAIN = financial;
state.dimensions.financial.constructIds.push('FINANCIAL_STRAIN');

state.facts.f1 = createFact({
  factId: 'f1', semanticKey: 'financial.obligation_pressure', value: true,
  sourceType: 'member_report', sourceRef: 'Q:FIN001', affectedConstructId: 'FINANCIAL_STRAIN',
});
assert.equal(state.facts.f1.affectedConstructId, 'FINANCIAL_STRAIN');

state.focusDecisions.FINANCIAL_STRAIN = createFocusDecision({
  constructId: 'FINANCIAL_STRAIN', decision: 'accepted', decidedAt: '2026-08-30T00:01:00Z',
});
state.activeFocusIds.push('FINANCIAL_STRAIN');
assert.deepEqual(validateMemberStateShape(state), []);

state.activeFocusIds.push('SLEEP_QUALITY');
assert.ok(validateMemberStateShape(state).some(error => error.includes('accepted member decision: SLEEP_QUALITY')));
state.activeFocusIds.pop();

assert.throws(() => createConstructState({ constructId: 'money_pressure' }), /Unknown constructId/);
assert.throws(() => createFact({ factId:'bad', semanticKey:'x', sourceType:'test', sourceRef:'x', affectedConstructId:'low_focus' }), /Unknown constructId/);

console.log('Member State v3 is construct-native, preserves unknowns and requires accepted member Focus');
