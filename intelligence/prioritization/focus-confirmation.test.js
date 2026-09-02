import assert from 'node:assert/strict';
import { createMemberState } from '../state/member-state-contract.js';
import { applyMemberStateTransition, MEMBER_STATE_EVENT as E } from '../state/member-state-transition.js';
import { confirmFocus, applyFocusConfirmation, focusConfirmationPlanningInput } from './focus-confirmation.js';

const at='2026-08-30T16:00:00Z';
let state=createMemberState({memberId:'T0001',now:at});
for(const id of ['FINANCIAL_STRAIN','SLEEP_QUALITY','ACTIVITY_LEVEL','VALUES_CLARITY'])state=applyMemberStateTransition(state,{type:E.CONSTRUCT_UPDATED,payload:{constructId:id,status:'supported'},source:'discovery',at,expectedRevision:state.revision});
const prioritization={memberStateRevision:state.revision,recommended:[{constructId:'FINANCIAL_STRAIN',rank:1},{constructId:'SLEEP_QUALITY',rank:2},{constructId:'ACTIVITY_LEVEL',rank:3}],alternatives:[{constructId:'VALUES_CLARITY',rank:4}]};
const confirmation=confirmFocus({prioritization,decisions:[
  {constructId:'SLEEP_QUALITY',decision:'accepted',memberRank:1},
  {constructId:'FINANCIAL_STRAIN',decision:'deferred',reasonCodes:['not_now']},
  {constructId:'ACTIVITY_LEVEL',decision:'accepted',memberRank:2},
],constraints:[{type:'energy',constructId:'ACTIVITY_LEVEL',note:'limited capacity'}],decidedAt:at});
assert.equal(confirmation.memberChangedRecommendation,true);
assert.deepEqual(confirmation.accepted.map(x=>x.constructId),['SLEEP_QUALITY','ACTIVITY_LEVEL']);
assert.equal(confirmation.declined[0].decision,'deferred');
assert.ok(confirmation.accepted[1].constraintRefs.includes('focus-constraint:1'));

const updated=applyFocusConfirmation(state,confirmation);
assert.deepEqual(updated.activeFocusIds,['SLEEP_QUALITY','ACTIVITY_LEVEL']);
assert.equal(updated.focusDecisions.FINANCIAL_STRAIN.decision,'deferred');
assert.equal(updated.constraints['focus-constraint:1'].type,'energy');
assert.equal(updated.memberContext.capacity,'unknown');
assert.equal(updated.constructs.ACTIVITY_LEVEL.status,'supported');

const planningInput=focusConfirmationPlanningInput(confirmation,{memberState:updated,evidenceRefs:['d1']});
assert.equal(planningInput.memberStateRevision,updated.revision);
assert.deepEqual(planningInput.focuses.map(x=>x.constructId),['SLEEP_QUALITY','ACTIVITY_LEVEL']);
assert.ok(planningInput.constraintRefs.includes('focus-constraint:1'));
assert.throws(()=>focusConfirmationPlanningInput(confirmation,{memberState:state}),/post-confirmation Member State revision/);

const alternative=confirmFocus({prioritization,decisions:[{constructId:'VALUES_CLARITY',decision:'accepted',memberRank:1}],decidedAt:at});
assert.deepEqual(alternative.accepted.map(x=>x.constructId),['VALUES_CLARITY']);

const replacement=confirmFocus({prioritization,decisions:[
 {constructId:'FINANCIAL_STRAIN',decision:'replaced',replacementConstructId:'VALUES_CLARITY'},
 {constructId:'VALUES_CLARITY',decision:'accepted',memberRank:1},
 {constructId:'SLEEP_QUALITY',decision:'deferred'},
 {constructId:'ACTIVITY_LEVEL',decision:'deferred'},
],decidedAt:at});
const replacedState=applyFocusConfirmation(state,replacement);
assert.equal(replacedState.focusDecisions.FINANCIAL_STRAIN.decision,'replaced');
assert.equal(replacedState.focusDecisions.FINANCIAL_STRAIN.replacementConstructId,'VALUES_CLARITY');
assert.deepEqual(replacedState.activeFocusIds,['VALUES_CLARITY']);

assert.throws(()=>confirmFocus({prioritization,decisions:[{constructId:'FINANCIAL_STRAIN',decision:'postponed'}],decidedAt:at}),/unsupported Focus decision/);
assert.throws(()=>confirmFocus({prioritization,decisions:[{constructId:'FINANCIAL_STRAIN',decision:'paused'}],decidedAt:at}),/unsupported Focus decision/);
assert.throws(()=>confirmFocus({prioritization,decisions:[{constructId:'FINANCIAL_STRAIN',decision:'replaced'}],decidedAt:at}),/governed EL8 construct ID/);
assert.throws(()=>confirmFocus({prioritization,decisions:[{constructId:'FINANCIAL_STRAIN',decision:'replaced',replacementConstructId:'SLEEP_QUALITY'}],decidedAt:at}),/accepted in the same confirmation/);
assert.throws(()=>confirmFocus({prioritization,decisions:[{constructId:'money_pressure',decision:'accepted'}],decidedAt:at}),/governed EL8 construct ID/);
assert.throws(()=>confirmFocus({prioritization,decisions:[{constructId:'SUPPORT_AVAILABILITY',decision:'accepted'}],decidedAt:at}),/not a legitimate Prioritization candidate/);
assert.throws(()=>confirmFocus({prioritization,decisions:[{constructId:'SLEEP_QUALITY',decision:'accepted'}],constraints:['severity'],decidedAt:at}),/unsupported Focus constraint/);

console.log('Member Focus confirmation uses canonical lifecycle, legitimate alternatives and post-confirmation Planning revision');
