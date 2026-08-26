import assert from 'node:assert/strict';
import { createOutcome } from './outcomes.js';

const now = '2026-01-01T00:00:00.000Z';

{
  const outcome = createOutcome({
    outcomeId: 'outcome-1',
    interventionId: 'intervention:money_pressure',
    concernId: 'money_pressure',
    status: 'completed',
    observationRefs: ['obs-followup-1'],
    evidenceRefs: ['ev-followup-1'],
    recordedAt: now,
  });
  assert.equal(outcome.status, 'completed');
  assert.equal(outcome.interventionId, 'intervention:money_pressure');
  assert.deepEqual(outcome.observationRefs, ['obs-followup-1']);
  assert.deepEqual(outcome.evidenceRefs, ['ev-followup-1']);
  assert.equal('score' in outcome, false);
}

for (const status of ['completed', 'partially_completed', 'not_completed', 'unknown']) {
  assert.equal(createOutcome({ outcomeId: `outcome-${status}`, interventionId: 'intervention:test', concernId: 'stress', status }).status, status);
}

assert.throws(() => createOutcome({ interventionId: 'intervention:test', concernId: 'stress', status: 'completed' }), /outcomeId is required/);
assert.throws(() => createOutcome({ outcomeId: 'bad', concernId: 'stress', status: 'completed' }), /interventionId is required/);
assert.throws(() => createOutcome({ outcomeId: 'bad', interventionId: 'intervention:test', status: 'completed' }), /concernId is required/);
assert.throws(() => createOutcome({ outcomeId: 'bad', interventionId: 'intervention:test', concernId: 'stress', status: 'better' }), /unknown outcome status/);

console.log('minimal canonical Outcome tests passed');
