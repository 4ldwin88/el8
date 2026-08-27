'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');
const {
  createMemberState,
  assertMemberState,
  DIMENSIONS,
} = require('./member-state');
const { applyMemberStateUpdate } = require('./member-state-update');

test('creates one complete canonical state across all eight dimensions', () => {
  const state = createMemberState({ memberId: 'T0001', now: '2026-08-27T12:00:00.000Z' });
  assert.equal(state.memberId, 'T0001');
  assert.deepEqual(Object.keys(state.dimensions), [...DIMENSIONS]);
  assert.equal(state.revision, 0);
  assert.equal(state.engagementBurden.throttle.active, false);
  assertMemberState(state);
});

test('updates are immutable, attributable and revisioned', () => {
  const state = createMemberState({ memberId: 'T0001', now: '2026-08-27T12:00:00.000Z' });
  const next = applyMemberStateUpdate(state, {
    type: 'EVIDENCE_RECORDED',
    at: '2026-08-27T12:01:00.000Z',
    source: 'track.manual',
    reason: 'member submitted evidence',
    payload: {
      id: 'ev-1',
      kind: 'MEMBER_REPORT',
      value: 'walked 20 minutes',
      provenance: 'MANUAL',
      confidence: 'DIRECT_MEMBER_REPORT',
    },
  });

  assert.equal(state.evidence.length, 0);
  assert.equal(next.evidence.length, 1);
  assert.equal(next.revision, 1);
  assert.equal(next.history[0].source, 'track.manual');
});

test('capacity throttling is durable state, not hidden engine behavior', () => {
  const state = createMemberState({ memberId: 'T0001' });
  const next = applyMemberStateUpdate(state, {
    type: 'CAPACITY_THROTTLE_UPDATED',
    at: '2026-08-27T12:02:00.000Z',
    source: 'feedback.capacity-policy',
    payload: {
      active: true,
      policyVersion: 'capacity-v1',
      reasonCodes: ['ACCUMULATED_BURDEN'],
      activatedAt: '2026-08-27T12:02:00.000Z',
    },
  });

  assert.equal(next.engagementBurden.throttle.active, true);
  assert.deepEqual(next.engagementBurden.throttle.reasonCodes, ['ACCUMULATED_BURDEN']);
});

test('Explore consideration remains passive until explicitly promoted', () => {
  const state = createMemberState({ memberId: 'T0001' });
  const next = applyMemberStateUpdate(state, {
    type: 'CONSIDERATION_UPDATED',
    at: '2026-08-27T12:03:00.000Z',
    source: 'explore.save',
    payload: {
      id: 'consider-1',
      itemRef: 'module:sleep-basics',
      status: 'SAVED',
      savedAt: '2026-08-27T12:03:00.000Z',
    },
  });

  assert.equal(next.considerations[0].status, 'SAVED');
  assert.equal(next.activePlan.interventions.length, 0);
});

test('hypotheses preserve confidence and revalidation metadata', () => {
  const state = createMemberState({ memberId: 'T0001' });
  const next = applyMemberStateUpdate(state, {
    type: 'HYPOTHESIS_UPDATED',
    at: '2026-08-27T12:04:00.000Z',
    source: 'discovery',
    payload: {
      id: 'hyp-1',
      relationship: ['occupational', 'emotional'],
      status: 'SUSPECTED',
      confidence: 0.45,
      provenance: ['ev-1'],
      lastValidatedAt: null,
      revalidationPolicy: 'relationship-policy-v1',
      revalidateAfter: '2026-09-10T12:04:00.000Z',
    },
  });

  assert.equal(next.hypotheses[0].status, 'SUSPECTED');
  assert.equal(next.hypotheses[0].revalidationPolicy, 'relationship-policy-v1');
});
