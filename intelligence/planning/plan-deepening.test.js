import assert from 'node:assert/strict';
import { buildPlanDeepening, applyPlanDeepening } from './plan-deepening.js';

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
  assert.equal(result.blocking.length,0,'confirmed onboarding evidence must be reused');
  assert.equal(result.optional.length,1);
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

console.log('plan-deepening tests passed');
