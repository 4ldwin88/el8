import assert from'node:assert/strict';
import{resultPayload}from'../app/research/intelligence-test-contract.js';

const session={
 id:'00000000-0000-4000-8000-000000000012',
 environment:'internal_human_qa',simulation:true,
 telemetry:{failed:0,last_error:null},
 recommended_priorities:[{constructId:'FINANCIAL_STRAIN'},{constructId:'JOB_SECURITY'},{constructId:'PHYSICAL_CONDITION'}],
 confirmed_focus:[{constructId:'FINANCIAL_STRAIN'},{constructId:'JOB_SECURITY'},{constructId:'PHYSICAL_CONDITION'}],
 focus_confirmation:{accepted:[{constructId:'FINANCIAL_STRAIN'},{constructId:'JOB_SECURITY'},{constructId:'PHYSICAL_CONDITION'}]},
 member_state:{revision:4},
 planning_input:{focusIds:['FINANCIAL_STRAIN','JOB_SECURITY','PHYSICAL_CONDITION']},
 canonical_plan:{status:'proposed',proposedActions:[{actionId:'ACT000020'},{actionId:'ACT000016'}],focusResolutions:[{focusId:'PHYSICAL_CONDITION',status:'professional_route'}]},
 selected_action_ids:['ACT000020','ACT000016'],
 survey:{understood:'3',useful:'3'},
 start_perf:performance.now()
};
const payload=resultPayload(session);
assert.deepEqual(payload.confirmed_priorities,session.confirmed_focus,'confirmed Focus must survive completion payload');
assert.deepEqual(payload.canonical_plan,session.canonical_plan,'canonical Plan must survive completion payload');
assert.deepEqual(payload.proposed_plan,session.canonical_plan,'legacy proposed_plan projection must not be empty');
assert.deepEqual(payload.selection_evidence.selected_action_ids,['ACT000020','ACT000016'],'selected Actions must survive completion payload');
assert.deepEqual(payload.selection_evidence.focus_confirmation,session.focus_confirmation,'Focus confirmation evidence must survive completion payload');
assert.deepEqual(payload.member_state,session.member_state,'Member State must survive completion payload');
assert.equal(payload.canonical_plan.focusResolutions[0].status,'professional_route','non-action Focus disposition must remain durable instead of disappearing');
console.log('G-02 result persistence regression passed');
