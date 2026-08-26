import assert from 'node:assert/strict';
import { createMemberState, createConcernState } from '../state/member-state-contract.js';
import { prioritizeMemberState } from './prioritization.js';

const now = '2026-01-01T00:00:00.000Z';

function stateWith(concerns) {
  const state = createMemberState({ memberId: 'member-1', now });
  for (const input of concerns) {
    const concern = createConcernState({ concernId: input.concernId, status: input.status, now });
    concern.sufficiency = input.sufficiency ?? 'insufficient';
    concern.evidenceRefs = [...(input.evidenceRefs ?? [])];
    concern.observationRefs = [...(input.observationRefs ?? [])];
    state.concerns[concern.concernId] = concern;
  }
  return state;
}

{
  const result = prioritizeMemberState(stateWith([
    { concernId: 'stress', status: 'candidate', sufficiency: 'insufficient', evidenceRefs: ['ev-stress'] },
    { concernId: 'money_pressure', status: 'active', sufficiency: 'sufficient', evidenceRefs: ['ev-money'], observationRefs: ['obs-money'] },
    { concernId: 'poor_sleep', status: 'resolved', sufficiency: 'sufficient' },
  ]), { now });
  assert.equal(result.blockedBySafety, false);
  assert.deepEqual(result.priorityItems.map(item => item.concernId), ['money_pressure', 'stress']);
  assert.deepEqual(result.unresolvedConcernIds, ['stress']);
  assert.deepEqual(result.priorityItems[0].evidenceRefs, ['ev-money']);
  assert.deepEqual(result.priorityItems[0].observationRefs, ['obs-money']);
  assert.equal(result.priorityItems[0].rank, 1);
  assert.equal(result.priorityItems[1].rank, 2);
  assert.equal('score' in result.priorityItems[0], false);
  assert.ok(result.priorityItems[0].decisionFactors);
}

{
  const result = prioritizeMemberState(stateWith([
    { concernId: 'stress', status: 'candidate', sufficiency: 'sufficient' },
    { concernId: 'poor_sleep', status: 'candidate', sufficiency: 'sufficient' },
  ]), {
    now,
    decisionFactors: {
      stress: { urgency: 0.2, memberImportance: 0.4, burden: 0.2 },
      poor_sleep: { urgency: 0.9, memberImportance: 0.8, burden: 0.3 },
    },
  });
  assert.deepEqual(result.priorityItems.map(item => item.concernId), ['poor_sleep', 'stress']);
  assert.ok(result.priorityItems[0].rationaleCodes.includes('high_urgency'));
  assert.ok(result.priorityItems[0].rationaleCodes.includes('member_importance'));
  assert.equal('score' in result.priorityItems[0], false);
}

{
  const result = prioritizeMemberState(stateWith([
    { concernId: 'stress', status: 'candidate', sufficiency: 'insufficient' },
  ]), { safetyDisposition: { disposition: 'pause_ordinary_flow' }, now });
  assert.equal(result.blockedBySafety, true);
  assert.deepEqual(result.priorityItems, []);
  assert.deepEqual(result.rationaleCodes, ['safety_override']);
}

{
  const result = prioritizeMemberState(stateWith([
    { concernId: 'low_energy', status: 'candidate', sufficiency: 'insufficient' },
  ]), { now });
  assert.equal(result.priorityItems[0].status, 'candidate');
  assert.equal(result.priorityItems[0].sufficiency, 'insufficient');
  assert.deepEqual(result.unresolvedConcernIds, ['low_energy']);
}

console.log('canonical Prioritization tests passed');
