import assert from 'node:assert/strict';
import { createMemberState } from '../state/member-state-contract.js';
import { applyMemberStateTransition, MEMBER_STATE_EVENT as E } from '../state/member-state-transition.js';
import { confirmFocus, applyFocusConfirmation, focusConfirmationPlanningInput } from './focus-confirmation.js';

const at='2026-08-30T16:00:00Z';
let state=createMemberState({memberId:'T0001',now:at});
for(const id of ['FINANCIAL_STRAIN','SLEEP_QUALITY','ACTIVITY_LEVEL'])state=applyMemberStateTransition(state,{type:E.CONSTRUCT_UPDATED,payload:{constructId:id,status:'supported'},source:'discovery',at,expectedRevision:state.revision});
const prioritization={memberStateRevision:state.revision,recommended:[{constructId:'FINANCIAL_STRAIN',rank:1},{constructId:'SLEEP_QUALITY',rank:2},{constructId:'ACTIVITY_LEVEL',rank:3}]};
const confirmation=confirmFocus({prioritization,decisions:[
  {constructId:'SLEEP_QUALITY',decision:'accepted',memberRank:1},
  {constructId:'FINANCIAL_STRAIN',decision:'postponed',reasonCodes:['not_now']},
  {constructId:'ACTIVITY_LEVEL',decision:'accepted',memberRank:2},
],constraints:[{type:'energy',constructId:'ACTIVITY_LEVEL',note:'limited capacity'}],decidedAt:at});
assert.equal(confirmation.memberChangedRecommendation,true);
assert.deepEqual(confirmation.accepted.map(x=>x.constructId),['SLEEP_QUALITY','ACTIVITY_LEVEL']);
assert.equal(confirmation.declined[0].decision,'postponed');
assert.ok(confirmation.accepted[1].constraintRefs.includes('focus-constraint:1'));

const updated=applyFocusConfirmation(state,confirmation);
assert.deepEqual(updated.activeFocusIds,['SLEEP_QUALITY','ACTIVITY_LEVEL']);
assert.equal(updated.focusDecisions.FINANCIAL_STRAIN.decision,'postponed');
assert.equal(updated.constraints['focus-constraint:1'].type,'energy');
// Constraint capture does not silently convert capacity into low or alter construct status.
assert.equal(updated.memberContext.capacity,'unknown');
assert.equal(updated.constructs.ACTIVITY_LEVEL.status,'supported');

const planningInput=focusConfirmationPlanningInput(confirmation,{evidenceRefs:['d1']});
assert.deepEqual(planningInput.focuses.map(x=>x.constructId),['SLEEP_QUALITY','ACTIVITY_LEVEL']);
assert.ok(planningInput.constraintRefs.includes('focus-constraint:1'));

assert.throws(()=>confirmFocus({prioritization,decisions:[{constructId:'money_pressure',decision:'accepted'}],decidedAt:at}),/governed EL8 construct ID/);
assert.throws(()=>confirmFocus({prioritization,decisions:[{constructId:'VALUES_CLARITY',decision:'accepted'}],decidedAt:at}),/not a Prioritization candidate/);
assert.throws(()=>confirmFocus({prioritization,decisions:[{constructId:'SLEEP_QUALITY',decision:'accepted'}],constraints:['severity'],decidedAt:at}),/unsupported Focus constraint/);

console.log('Member Focus confirmation preserves member choice, ordering and constraints without becoming Planning or severity logic');
