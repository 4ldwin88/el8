import assert from 'node:assert/strict';
import { reviewAction, memberReviewCopy } from './adaptive-review.js';

const action = { actionId: 'ACT-SLEEP-001', focusIds: ['sleep_quality'], measurement: { requiredReviewSignals: ['adherence', 'outcome'] } };
const plan = { status: 'active', focusIds: ['sleep_quality'], activeActions: [action] };

const maintain = reviewAction({ plan, actionId: action.actionId, status: 'completed', adherence: 1, benefitDirection: 'improved', measurementSufficient: true });
assert.equal(maintain.review.valid, true);
assert.equal(maintain.adjustment.disposition, 'MAINTAIN');
assert.equal(memberReviewCopy(maintain.decision).code, 'maintain');

const replace = reviewAction({ plan, actionId: action.actionId, status: 'completed', adherence: 1, benefitDirection: 'unchanged', measurementSufficient: true });
assert.equal(replace.adjustment.disposition, 'REPLACE');
assert.deepEqual(replace.adjustment.rejectedActionIds, [action.actionId]);

const simplify = reviewAction({ plan, actionId: action.actionId, status: 'partially_completed', adherence: 0.2, benefitDirection: 'unchanged', barrierCodes: ['burden'], measurementSufficient: true });
assert.equal(simplify.adjustment.disposition, 'SIMPLIFY');

const insufficient = reviewAction({ plan, actionId: action.actionId, status: 'partially_completed', adherence: 0.7, benefitDirection: 'unknown', measurementSufficient: false });
assert.equal(insufficient.adjustment.route, 'review-deepening');
assert.equal(insufficient.decision.code, 'more_evidence');

assert.throws(() => reviewAction({ plan, actionId: 'missing', adherence: 1, benefitDirection: 'improved' }), /Active canonical Action required/);

console.log('Governed member Review adapter regression: PASS');
