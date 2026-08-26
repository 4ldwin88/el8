import assert from 'node:assert/strict';
import { createOutcome, interpretOutcome } from './outcomes.js';

const now = '2026-01-01T00:00:00.000Z';

{
  const outcome = createOutcome({outcomeId:'outcome-1',interventionId:'financial_next_step',concernId:'money_pressure',status:'completed',benefitDirection:'improved',measurementSufficient:true,observationRefs:['obs-followup-1'],evidenceRefs:['ev-followup-1'],recordedAt:now});
  assert.equal(outcome.status,'completed');
  assert.equal(outcome.adherence,1);
  assert.equal(outcome.benefitDirection,'improved');
  assert.equal('score' in outcome,false);
  assert.deepEqual(interpretOutcome(outcome),{adaptation:'maintain',attribution:null});
}

{
  const poorOutcome=createOutcome({outcomeId:'poor',interventionId:'walk',concernId:'low_activity',status:'completed',adherence:.9,benefitDirection:'unchanged',measurementSufficient:true});
  assert.deepEqual(interpretOutcome(poorOutcome),{adaptation:'reassess',attribution:'action_or_hypothesis'},'adequate adherence plus poor outcome must not be mislabeled non-adherence');
}

{
  const barrier=createOutcome({outcomeId:'barrier',interventionId:'walk',concernId:'low_activity',status:'partially_completed',adherence:.3,barrierCodes:['schedule']});
  assert.deepEqual(interpretOutcome(barrier),{adaptation:'simplify_or_reschedule',attribution:'adherence_or_barrier'});
}

{
  const insufficient=createOutcome({outcomeId:'measure',interventionId:'stabilize_sleep_window',concernId:'poor_sleep',status:'completed',adherence:.9,benefitDirection:'unknown',measurementSufficient:false});
  assert.deepEqual(interpretOutcome(insufficient),{adaptation:'deepen_measurement',attribution:'measurement_insufficiency'});
}

{
  const changed=createOutcome({outcomeId:'context',interventionId:'income_action',concernId:'work_instability',status:'partially_completed',contextChanged:true});
  assert.deepEqual(interpretOutcome(changed),{adaptation:'reprioritize',attribution:'context_change'});
}

{
  const safety=createOutcome({outcomeId:'safety',interventionId:'strength_activity',concernId:'low_activity',status:'partially_completed',safetyChanged:true});
  assert.deepEqual(interpretOutcome(safety),{adaptation:'escalate',attribution:'safety_change'});
}

for (const status of ['completed','partially_completed','not_completed','unknown']) assert.equal(createOutcome({outcomeId:`outcome-${status}`,interventionId:'intervention:test',concernId:'stress',status}).status,status);
assert.throws(()=>createOutcome({outcomeId:'bad',interventionId:'x',concernId:'stress',status:'completed',adherence:2}),/adherence/);
assert.throws(()=>createOutcome({outcomeId:'bad',interventionId:'x',concernId:'stress',status:'completed',benefitDirection:'better'}),/benefit direction/);
assert.throws(()=>createOutcome({outcomeId:'bad',interventionId:'x',concernId:'stress',status:'completed',barrierCodes:['mystery']}),/barrier code/);

console.log('canonical Outcome learning tests passed');
