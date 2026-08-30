import assert from 'node:assert/strict';
import test from 'node:test';
import {assertPlanReadyForActivation,canonicalActionsForActivation} from './activation-readiness.js';

const proposedPlan=()=>({
  schemaVersion:'2.0.0',
  status:'proposed',
  focusIds:['SLEEP_QUALITY'],
  proposedActions:[{
    actionId:'PHY-004',
    name:'Set a consistent sleep window',
    actionScope:'construct',
    focusIds:['SLEEP_QUALITY'],
    intent:'Improve sleep regularity',
    instruction:'Use a consistent sleep and wake window.',
    rationale:'Regular timing can improve sleep consistency.',
    measurement:{adherence:'days followed',outcome:'sleep consistency'},
    review:{trigger:'review_after_initial_trial'},
    burden:{level:'low'},
    trackingRequirement:{required:true},
    additionalAssessmentRequirement:{required:false},
    iconKey:'track'
  }],
  activationStatus:'ready'
});

test('proposed canonical Plan projects Actions without problem, priority or intervention authority',()=>{
  const actions=canonicalActionsForActivation(proposedPlan());
  assert.equal(actions[0].source,'canonical-planning');
  assert.equal(actions[0].actionId,'PHY-004');
  assert.deepEqual(actions[0].focusIds,['SLEEP_QUALITY']);
  assert.equal('problemId' in actions[0],false);
  assert.equal('priorityId' in actions[0],false);
  assert.equal('intervention_id' in actions[0],false);
});

test('proposed canonical Plan is activation ready',()=>{
  assert.equal(assertPlanReadyForActivation(proposedPlan()).length,1);
});

test('safety override cannot activate',()=>{
  assert.throws(()=>assertPlanReadyForActivation({status:'blocked',reason:'safety_override'}),/Safety clarification/);
});

test('Action-selection deepening cannot activate',()=>{
  const plan=proposedPlan();
  plan.selectionDeepening={required:true};
  assert.throws(()=>assertPlanReadyForActivation(plan),/Action-selection evidence/);
});

test('Action-specific blocking deepening cannot activate',()=>{
  const plan=proposedPlan();
  plan.deepening={blocking:[{actionId:'PHY-004'}],requirements:[{actionId:'PHY-004'}]};
  plan.activationStatus='needs_plan_specific_assessment';
  assert.throws(()=>assertPlanReadyForActivation(plan),/Action-specific assessment/);
});

test('unidentified Actions cannot activate',()=>{
  const plan=proposedPlan();
  plan.proposedActions=[{}];
  assert.throws(()=>assertPlanReadyForActivation(plan),/identified canonical Action/);
});
