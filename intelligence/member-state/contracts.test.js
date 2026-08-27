'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');
const { CONTRACTS, assertBoundaryMessage } = require('./contracts');

test('Discovery hands supported problems to Prioritization, not a plan', () => {
  assert.deepEqual(CONTRACTS.discoveryToPrioritization.required, [
    'memberStateRevision',
    'supportedProblemIds',
  ]);
  assert.equal(CONTRACTS.discoveryToPrioritization.produces.includes('interventionOptions'), false);
  assert.equal(CONTRACTS.discoveryToPrioritization.produces.includes('recommendedPriorities'), true);
});

test('Planning begins only from confirmed member priority choice', () => {
  const message = assertBoundaryMessage('priorityChoiceToPlanning', {
    memberStateRevision: 4,
    confirmedPriorityIds: ['priority:p03'],
    memberChoice: { mode: 'ACCEPTED_RECOMMENDATION' },
  });
  assert.equal(message.confirmedPriorityIds[0], 'priority:p03');
});

test('Execution evidence goes to Feedback rather than adapting the plan directly', () => {
  const message = assertBoundaryMessage('executionToFeedback', {
    memberStateRevision: 8,
    planId: 'plan-001',
    evidenceRefs: ['ev-adherence', 'ev-outcome'],
  });
  assert.equal(message.planId, 'plan-001');
  assert.equal(CONTRACTS.executionToFeedback.produces.includes('nextDisposition'), true);
  assert.equal(CONTRACTS.executionToFeedback.produces.includes('interventionOptions'), false);
});

test('Feedback disposition vocabulary is constrained', () => {
  assert.throws(() => assertBoundaryMessage('feedbackToMemberState', {
    memberStateRevision: 9,
    learningUpdates: [],
    nextDisposition: 'MAKE_UP_A_NEW_PLAN',
  }), /nextDisposition is invalid/);

  assert.doesNotThrow(() => assertBoundaryMessage('feedbackToMemberState', {
    memberStateRevision: 9,
    learningUpdates: [],
    nextDisposition: 'REPLACE',
  }));
});

test('boundary messages reject stale/ambiguous revision metadata', () => {
  assert.throws(() => assertBoundaryMessage('evidenceToDiscovery', {
    memberStateRevision: -1,
    evidenceRefs: [],
  }), /non-negative integer/);
});
