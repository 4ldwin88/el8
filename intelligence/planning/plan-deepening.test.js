import assert from 'node:assert/strict';
import test from 'node:test';
import { buildPlanDeepening, applyPlanDeepening } from './plan-deepening.js';

const sleepAction={
  actionId:'PHY-004',
  deepeningRequirements:[
    {id:'sleep_baseline',evidenceKey:'sleepBaseline',purpose:'baseline_measurement',decisionImpact:'Defines starting point and permits outcome comparison.',prompt:'For the next few days, what time do you usually fall asleep and wake up?',requiredBeforeActivation:true},
    {id:'preferred_window',evidenceKey:'preferredSleepWindow',purpose:'personalization',decisionImpact:'Changes the recommended sleep window.',requiredBeforeActivation:false},
    {id:'curiosity_only',evidenceKey:'favoritePillow',purpose:'personalization'}
  ]
};

test('Action deepening asks only decision-changing requirements',()=>{
  const result=buildPlanDeepening([sleepAction],{});
  assert.equal(result.required,true);
  assert.equal(result.requirements.length,2);
  assert.equal(result.blocking.length,1);
  assert.equal(result.blocking[0].actionId,'PHY-004');
});

test('Action deepening reuses existing evidence and preserves distinct optional personalization',()=>{
  const result=buildPlanDeepening([sleepAction],{sleepBaseline:{bed:'00:30',wake:'08:30'}});
  assert.equal(result.blocking.length,0);
  assert.equal(result.optional.length,1);
  assert.equal(result.optional[0].evidenceKey,'preferredSleepWindow');
});

test('blocking Action-specific evidence prevents activation readiness',()=>{
  const result=applyPlanDeepening({status:'proposed',proposedActions:[sleepAction]},{});
  assert.equal(result.activationStatus,'needs_plan_specific_assessment');
});

test('simple Actions do not manufacture extra assessment',()=>{
  const result=applyPlanDeepening({status:'proposed',proposedActions:[{actionId:'PHY-002'}]},{});
  assert.equal(result.activationStatus,'ready');
});
