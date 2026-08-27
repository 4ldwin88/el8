import assert from 'node:assert/strict';
import { createOutcome } from './outcomes.js';

const now = '2026-01-01T00:00:00.000Z';

{
  const outcome = createOutcome({outcomeId:'outcome-1',interventionId:'financial_next_step',concernId:'money_pressure',status:'completed',benefitDirection:'improved',measurementSufficient:true,observationRefs:['obs-followup-1'],evidenceRefs:['ev-followup-1'],recordedAt:now});
  assert.equal(outcome.status,'completed');
  assert.equal(outcome.adherence,1);
  assert.equal(outcome.benefitDirection,'improved');
  assert.equal(outcome.measurementSufficient,true);
  assert.deepEqual(outcome.observationRefs,['obs-followup-1']);
  assert.deepEqual(outcome.evidenceRefs,['ev-followup-1']);
  assert.equal('score' in outcome,false);
  assert.equal('adaptation' in outcome,false);
}

{
  const barrier=createOutcome({outcomeId:'barrier',interventionId:'walk',concernId:'low_activity',status:'partially_completed',adherence:.3,benefitDirection:'unchanged',barrierCodes:['schedule'],burden:.8,contextChanged:true});
  assert.equal(barrier.adherence,.3);
  assert.equal(barrier.benefitDirection,'unchanged');
  assert.deepEqual(barrier.barrierCodes,['schedule']);
  assert.equal(barrier.burden,.8);
  assert.equal(barrier.contextChanged,true);
}

for (const status of ['completed','partially_completed','not_completed','unknown']) assert.equal(createOutcome({outcomeId:`outcome-${status}`,interventionId:'intervention:test',concernId:'stress',status}).status,status);
assert.throws(()=>createOutcome({outcomeId:'bad',interventionId:'x',concernId:'stress',status:'completed',adherence:2}),/adherence/);
assert.throws(()=>createOutcome({outcomeId:'bad',interventionId:'x',concernId:'stress',status:'completed',benefitDirection:'better'}),/benefit direction/);
assert.throws(()=>createOutcome({outcomeId:'bad',interventionId:'x',concernId:'stress',status:'completed',barrierCodes:['mystery']}),/barrier code/);

console.log('canonical Outcome evidence tests passed');
