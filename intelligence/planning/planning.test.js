import assert from 'node:assert/strict';
import { createPlanFromPriorities } from './planning.js';

const now = '2026-01-01T00:00:00.000Z';

{
  const plan = createPlanFromPriorities({
    blockedBySafety: false,
    priorityItems: [
      { priorityId: 'priority:money_pressure', rank: 1, concernId: 'money_pressure', status: 'active', sufficiency: 'sufficient', evidenceRefs: ['ev-money'], observationRefs: ['obs-money'] },
      { priorityId: 'priority:stress', rank: 2, concernId: 'stress', status: 'candidate', sufficiency: 'insufficient', evidenceRefs: ['ev-stress'], observationRefs: ['obs-stress'] },
    ],
    unresolvedConcernIds: ['stress'],
  }, { now });

  assert.equal(plan.blockedBySafety, false);
  assert.equal(plan.planItems.length, 1);
  assert.equal(plan.planItems[0].concernId, 'money_pressure');
  assert.equal(plan.planItems[0].priorityId, 'priority:money_pressure');
  assert.equal(plan.planItems[0].priorityRank, 1);
  assert.deepEqual(plan.planItems[0].evidenceRefs, ['ev-money']);
  assert.deepEqual(plan.planItems[0].observationRefs, ['obs-money']);
  assert.deepEqual(plan.unresolvedConcernIds, ['stress']);
  assert.equal('score' in plan.planItems[0], false);
}

{
  const plan = createPlanFromPriorities({
    blockedBySafety: false,
    priorityItems: [{ priorityId: 'priority:low_energy', rank: 1, concernId: 'low_energy', status: 'candidate', sufficiency: 'insufficient', evidenceRefs: ['ev-weak'], observationRefs: ['obs-weak'] }],
    unresolvedConcernIds: ['low_energy'],
  }, { now });
  assert.deepEqual(plan.planItems, []);
  assert.deepEqual(plan.unresolvedConcernIds, ['low_energy']);
}

{
  const plan = createPlanFromPriorities({
    blockedBySafety: true,
    priorityItems: [{ priorityId: 'priority:stress', rank: 1, concernId: 'stress', status: 'active', sufficiency: 'sufficient' }],
    unresolvedConcernIds: [],
  }, { now });
  assert.equal(plan.blockedBySafety, true);
  assert.deepEqual(plan.planItems, []);
  assert.deepEqual(plan.rationaleCodes, ['safety_override']);
}

assert.throws(() => createPlanFromPriorities(null), /prioritization.priorityItems is required/);
console.log('thin canonical Planning tests passed');
