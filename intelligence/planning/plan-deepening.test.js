import assert from 'node:assert/strict';
import { buildPlanDeepening, applyPlanDeepening } from './plan-deepening.js';
import { buildPlan } from './plan-engine.js';

const sleepAction={
  id:'sleep_consistency',
  deepeningRequirements:[
    {id:'sleep_baseline',evidenceKey:'sleepBaseline',purpose:'baseline_measurement',decisionImpact:'Defines starting point and permits outcome comparison.',prompt:'For the next few days, what time do you usually fall asleep and wake up?',requiredBeforeActivation:true},
    {id:'preferred_window',evidenceKey:'preferredSleepWindow',purpose:'personalization',decisionImpact:'Changes the recommended sleep window.',requiredBeforeActivation:false},
    {id:'curiosity_only',evidenceKey:'favoritePillow',purpose:'personalization'}
  ]
};

{
  const result=buildPlanDeepening([sleepAction],{});
  assert.equal(result.required,true);
  assert.equal(result.requirements.length,2,'questions without defined decision impact must not be asked');
  assert.equal(result.blocking.length,1);
}

{
  const result=buildPlanDeepening([sleepAction],{sleepBaseline:{bed:'00:30',wake:'08:30'}});
  assert.equal(result.blocking.length,0,'confirmed prior evidence must be reused');
  assert.equal(result.optional.length,1,'genuinely distinct personalization evidence should remain');
}

{
  const plan={status:'active',active:[sleepAction]};
  const result=applyPlanDeepening(plan,{});
  assert.equal(result.activationStatus,'needs_plan_specific_assessment');
}

{
  const simple={id:'short_walk'};
  const plan={status:'active',active:[simple]};
  const result=applyPlanDeepening(plan,{});
  assert.equal(result.activationStatus,'ready','simple actions must not trigger assessment by default');
}

{
  const discovery={ranked:[{id:'poor_sleep',confidence:.9,memberImportance:4,urgency:3,readiness:3}]};
  const selectionEvidence={'baseline.sleep_pattern':'Usually 5 hours with an inconsistent bedtime'};
  const plan=buildPlan(discovery,{capacity:'low',selectionEvidence});
  assert.equal(plan.status,'active');
  const repeated=plan.deepening.requirements.filter(r=>r.evidenceKey==='baseline.sleep_pattern');
  assert.equal(repeated.length,0,'selection evidence must satisfy an activation requirement with the same evidence key');
}

{
  const discovery={ranked:[{id:'poor_sleep',confidence:.9,memberImportance:4,urgency:3,readiness:3}]};
  const selectionEvidence={'baseline.sleep_pattern':'Usually 5 hours with an inconsistent bedtime'};
  const plan=buildPlan(discovery,{capacity:'low',selectionEvidence});
  const remaining=plan.deepening.requirements.map(r=>r.evidenceKey);
  assert.ok(remaining.every(k=>k!=='baseline.sleep_pattern'),'no selection fact should be asked twice');
  assert.ok(remaining.length>0,'distinct action-specific evidence must still be allowed to deepen the selected plan');
}

{
  const discovery={ranked:[{id:'poor_sleep',confidence:.9,memberImportance:4,urgency:3,readiness:3}]};
  const selectionEvidence={'baseline.sleep_pattern':'Usually 5 hours with an inconsistent bedtime'};
  const first=buildPlan(discovery,{capacity:'low',selectionEvidence});
  const blocking=first.deepening.blocking;
  const supplied=Object.fromEntries(blocking.map(r=>[r.evidenceKey,'confirmed activation detail']));
  const second=buildPlan(discovery,{capacity:'low',selectionEvidence,evidence:supplied});
  assert.equal(second.deepening.blocking.length,0,'later activation evidence must satisfy genuinely distinct blocking requirements');
  assert.notEqual(second.activationStatus,'needs_plan_specific_assessment');
}

console.log('plan-deepening tests passed');
