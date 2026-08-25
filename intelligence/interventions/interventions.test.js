import assert from 'node:assert/strict';
import { createInterventionCandidates, selectResponseMode } from './interventions.js';

const now = '2026-01-01T00:00:00.000Z';

{
  const result = createInterventionCandidates({
    blockedBySafety: false,
    planItems: [{
      planItemId: 'plan:money_pressure', concernId: 'money_pressure', priorityId: 'priority:money_pressure', priorityRank: 1,
      state: 'candidate', evidenceRefs: ['ev-money'], observationRefs: ['obs-money'], rationaleCodes: ['supported_priority'],
    }],
    unresolvedConcernIds: ['stress'],
  }, { now });

  assert.equal(result.blockedBySafety, false);
  assert.equal(result.interventionCandidates.length, 1);
  assert.equal(result.interventionCandidates[0].interventionId, 'intervention:money_pressure');
  assert.equal(result.interventionCandidates[0].planItemId, 'plan:money_pressure');
  assert.equal(result.interventionCandidates[0].responseMode, 'action');
  assert.deepEqual(result.interventionCandidates[0].evidenceRefs, ['ev-money']);
  assert.deepEqual(result.interventionCandidates[0].observationRefs, ['obs-money']);
  assert.deepEqual(result.unresolvedConcernIds, ['stress']);
  assert.equal('score' in result.interventionCandidates[0], false);
}

{
  const item = { concernId: 'stress' };
  assert.equal(selectResponseMode(item, { stress: { uncertainty: 0.8 } }).mode, 'deeper_assessment');
  assert.equal(selectResponseMode(item, { stress: { readiness: 0.2, knowledgeGap: 0.8 } }).mode, 'education');
  assert.equal(selectResponseMode(item, { stress: { readiness: 0.2, knowledgeGap: 0.1 } }).mode, 'tracking');
  assert.equal(selectResponseMode(item, { stress: { feasibility: 0.2 } }).mode, 'tracking');
  assert.equal(selectResponseMode(item, { stress: { readiness: 0.8, capacity: 0.8 } }).mode, 'action');
  assert.equal(selectResponseMode(item, { stress: { reassessmentDue: true } }).mode, 'reassessment');
}

{
  const result = createInterventionCandidates({ blockedBySafety: false, planItems: [], unresolvedConcernIds: ['low_energy'] }, { now });
  assert.deepEqual(result.interventionCandidates, []);
  assert.deepEqual(result.unresolvedConcernIds, ['low_energy']);
}

{
  const result = createInterventionCandidates({
    blockedBySafety: true,
    planItems: [{ planItemId: 'plan:stress', concernId: 'stress', state: 'candidate' }],
    unresolvedConcernIds: [],
  }, { now });
  assert.equal(result.blockedBySafety, true);
  assert.deepEqual(result.interventionCandidates, []);
  assert.deepEqual(result.rationaleCodes, ['safety_override']);
}

assert.throws(() => createInterventionCandidates(null), /plan.planItems is required/);
console.log('canonical Intervention tests passed');
