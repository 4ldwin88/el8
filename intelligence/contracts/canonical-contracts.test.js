import assert from 'node:assert/strict';
import {
  UNKNOWN,
  createConstructState,
  createPriorityCandidate,
  createConfirmedFocus,
  createPlanningInput,
} from './canonical-contracts.js';

const construct = createConstructState({ constructId: 'FINANCIAL_STRAIN' });
assert.equal(construct.confidence, UNKNOWN);
assert.equal(construct.status, 'unknown');

const priority = createPriorityCandidate({
  constructId: 'FINANCIAL_STRAIN',
  factors: { importance: undefined, urgency: 0.8, leverage: null },
});
assert.equal(priority.factors.importance, UNKNOWN);
assert.equal(priority.factors.leverage, UNKNOWN);
assert.equal(priority.factors.urgency, 0.8);
assert.notEqual(priority.factors.importance, 0.5);

assert.throws(
  () => createConstructState({ constructId: 'money_pressure' }),
  /canonical EL8 construct ID/,
);

assert.throws(
  () => createPriorityCandidate({ constructId: 'FINANCIAL_STRAIN', factors: { urgency: 2 } }),
  /must be unknown or a number from 0 to 1/,
);

const accepted = createConfirmedFocus({
  constructId: 'FINANCIAL_STRAIN',
  decision: 'accepted',
  decidedAt: '2026-08-30T00:00:00Z',
});

const rejected = createConfirmedFocus({
  constructId: 'SLEEP_QUALITY',
  decision: 'rejected',
  decidedAt: '2026-08-30T00:00:00Z',
});

const planning = createPlanningInput({ memberStateRevision: 1, focuses: [accepted] });
assert.equal(planning.focuses.length, 1);
assert.equal(planning.focuses[0].constructId, 'FINANCIAL_STRAIN');

assert.throws(
  () => createPlanningInput({ memberStateRevision: 1, focuses: [rejected] }),
  /only member-accepted Focus/,
);

console.log('Canonical Intelligence contracts preserve canonical IDs, explicit unknowns and member-confirmed Planning boundary');
