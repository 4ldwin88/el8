import assert from 'node:assert/strict';
import { buildPlanDeepening, applyPlanDeepening } from './plan-deepening.js';
import { buildCanonicalPlan } from './canonical-plan-engine.js';

const sleepAction={id:'sleep_consistency',deepeningRequirements:[{id:'sleep_baseline',evidenceKey:'sleepBaseline',purpose:'baseline_measurement',decisionImpact:'Defines starting point and permits outcome comparison.',prompt:'For the next few days, what time do you usually fall asleep and wake up?',requiredBeforeActivation:true},{id:'preferred_window',evidenceKey:'preferredSleepWindow',purpose:'personalization',decisionImpact:'Changes the recommended sleep window.',requiredBeforeActivation:false},{id:'curiosity_only',evidenceKey:'favoritePillow',purpose:'personalization'}]};
{
 const result=buildPlanDeepening([sleepAction],{});assert.equal(result.required,true);assert.equal(result.requirements.length,2,'questions without defined decision impact must not be asked');assert.equal(result.blocking.length,1);
}
{
 const result=buildPlanDeepening([sleepAction],{sleepBaseline:{bed:'00:30',wake:'08:30'}});assert.equal(result.blocking.length,0,'confirmed prior evidence must be reused');assert.equal(result.optional.length,1,'genuinely distinct personalization evidence should remain');
}
{
 const result=applyPlanDeepening({status:'active',active:[sleepAction]},{});assert.equal(result.activationStatus,'needs_plan_specific_assessment');
}
{
 const result=applyPlanDeepening({status:'active',active:[{id:'short_walk'}]},{});assert.equal(result.activationStatus,'ready','simple actions must not trigger assessment by default');
}

const incomeInput={memberStateRevision:8,confirmedPriorityIds:['priority:income'],memberChoice:{mode:'EXPLICIT_ACCEPTANCE'},problems:[{priorityId:'priority:income',problemId:'problem:income_gap',evidenceRefs:['work-route'],priorLearning:[]}],constraints:{profile:[],capacity:'low',manageability:'manageable',throttle:{active:false},safety:{disposition:'ORDINARY_FLOW'}}};
const incomeSelection={'work.current_income_route':'Build or sell something'};
{
 const plan=buildCanonicalPlan(incomeInput,{selectionEvidence:incomeSelection});assert.equal(plan.status,'active');assert.equal(plan.active[0].intervention_id,'I05_INCOME_EXPERIMENT');assert.equal(plan.activationStatus,'needs_plan_specific_assessment');assert.equal(plan.deepening.blocking.length,1);assert.equal(plan.deepening.blocking[0].evidenceKey,'activation.income_experiment');assert.ok(plan.deepening.requirements.every(r=>r.evidenceKey!=='work.current_income_route'),'selection evidence must never be asked twice during activation');
}
{
 const first=buildCanonicalPlan(incomeInput,{selectionEvidence:incomeSelection});const supplied=Object.fromEntries(first.deepening.blocking.map(r=>[r.evidenceKey,'Test a small batch of one member-approved product offer']));const second=buildCanonicalPlan(incomeInput,{selectionEvidence:incomeSelection,activationEvidence:supplied});assert.equal(second.deepening.blocking.length,0,'later activation evidence must satisfy genuinely distinct blocking requirements');assert.equal(second.activationStatus,'ready');assert.equal(second.active[0].intervention_id,first.active[0].intervention_id,'activation deepening must tailor the selected intervention rather than rerun Discovery or selection');
}
{
 const genericInput={...incomeInput,confirmedPriorityIds:['priority:sleep'],problems:[{priorityId:'priority:sleep',problemId:'problem:poor_sleep',evidenceRefs:['sleep'],priorLearning:[]}]};const plan=buildCanonicalPlan(genericInput,{selectionEvidence:{'baseline.sleep_pattern':'Timing changes a lot'}});assert.equal(plan.status,'active');assert.equal(plan.activationStatus,'ready','interventions without a decision-changing activation requirement must not manufacture extra assessment');
}
console.log('plan-deepening tests passed');
