import assert from 'node:assert/strict';
import { normalizeMemberState } from './member-state-normalizer.js';
import { MEMBER_STATE_SCHEMA_VERSION, createMemberState, createConstructState } from './member-state-contract.js';

const now = '2026-08-30T12:00:00Z';
const legacyV1 = {
  schemaVersion:'1.0.0', memberId:'T0001', revision:7, createdAt:'2026-08-20T00:00:00Z', updatedAt:now,
  profile:{ goals:['reduce pressure'], preferences:{mode:'low_friction'}, constraints:[], accessibilityNeeds:[] },
  dimensions:{ financial:{scope:'FOCUS',condition:null,confidence:null,evidenceRefs:['e1'],updatedAt:now} },
  evidence:[{id:'e1',observedAt:now,value:'pressure'}],
  problems:[
    {id:'money_pressure',status:'SUPPORTED',evidenceRefs:['e1']},
    {id:'lack_direction',status:'SUSPECTED',evidenceRefs:[]},
    {id:'problem:environment_friction',status:'SUPPORTED',evidenceRefs:['e2']},
  ],
  hypotheses:[],
  priorities:[{problemId:'money_pressure',status:'ACCEPTED',memberDecisionAt:now}],
  activePlan:{planId:'plan-1',status:'ACTIVE',interventions:[{interventionId:'FIN-001'}],updatedAt:now},
  engagementBurden:{capacity:null,manageability:null},
  safety:{disposition:'ORDINARY_FLOW',updatedAt:now},
  considerations:[],learning:[],history:[{revision:6}],
};

const migrated = normalizeMemberState(legacyV1,{now});
assert.equal(migrated.migrated,true);
assert.equal(migrated.state.schemaVersion,MEMBER_STATE_SCHEMA_VERSION);
assert.equal(migrated.state.revision,7);
assert.equal(migrated.state.memberContext.capacity,'unknown');
assert.equal(migrated.state.memberContext.manageability,'unknown');
assert.ok(migrated.state.constructs.FINANCIAL_STRAIN);
assert.ok(migrated.state.constructs.FINANCIAL_CONTROL);
assert.ok(migrated.state.constructs.MEANING_PURPOSE);
assert.ok(migrated.state.constructs.DIRECTION_CLARITY);
assert.ok(migrated.state.constructs.ENVIRONMENTAL_INTERFERENCE);
assert.equal(migrated.state.constructs.ENVIRONMENTAL_SUPPORT,undefined);
assert.equal(migrated.state.focusDecisions.FINANCIAL_STRAIN.decision,'accepted');
assert.equal(migrated.state.focusDecisions.FINANCIAL_CONTROL.decision,'accepted');
assert.ok(migrated.state.activeFocusIds.includes('FINANCIAL_STRAIN'));
assert.equal(migrated.state.activePlanRef.planId,'plan-1');
assert.deepEqual(migrated.state.activeActionIds,['FIN-001']);
assert.ok(migrated.notes.some(note => note.includes('ambiguous legacy semantic mapping')));

const legacyV2 = {
  schemaVersion:'2.0.0', memberId:'T0002', revision:2, createdAt:now, updatedAt:now,
  dimensions:{},
  concerns:{
    poor_sleep:{concernId:'poor_sleep',status:'supported',evidenceRefs:['q1']},
    low_support:{concernId:'low_support',status:'candidate',evidenceRefs:['q2']},
    home_instability:{concernId:'home_instability',status:'supported',evidenceRefs:['q3']},
  },
  constructs:{ENVIRONMENTAL_SUPPORT:{constructId:'ENVIRONMENTAL_SUPPORT',status:'supported',evidenceRefs:['q4']}},
  facts:{}, hypotheses:{}, indicators:{}, goals:{}, constraints:{}, activePriorities:['poor_sleep'],
  plan:null, reviewCycles:[], memberContext:{preferences:{},readiness:null,capacity:null},
  safety:{active:false,signalRefs:[],updatedAt:null}, historyRefs:[],
};
const migratedV2 = normalizeMemberState(legacyV2,{now});
assert.ok(migratedV2.state.constructs.SLEEP_QUALITY);
assert.ok(migratedV2.state.constructs.SUPPORT_AVAILABILITY);
assert.ok(migratedV2.state.constructs.HOUSING_STABILITY);
assert.ok(migratedV2.state.constructs.ENVIRONMENTAL_INTERFERENCE);
assert.equal(migratedV2.state.constructs.ENVIRONMENTAL_SUPPORT,undefined);
assert.equal(migratedV2.state.memberContext.capacity,'unknown');
assert.equal(migratedV2.state.focusDecisions.SLEEP_QUALITY.decision,'accepted');

const current = normalizeMemberState(migratedV2.state,{now});
assert.equal(current.migrated,false);
assert.deepEqual(current.state,migratedV2.state);

const v30=createMemberState({memberId:'T0003',now});
v30.schemaVersion='3.0.0';v30.revision=12;v30.constructs.SLEEP_QUALITY=createConstructState({constructId:'SLEEP_QUALITY',status:'supported',evidenceRefs:['ev:sleep'],factIds:['fact:sleep'],lastObservedAt:now});v30.dimensions.physical.constructIds=['SLEEP_QUALITY'];v30.facts['fact:sleep']={factId:'fact:sleep',semanticKey:'sleep.quality',value:'poor',sourceType:'member_report',sourceRef:'Q1',affectedConstructId:'SLEEP_QUALITY',affectedDimensionId:'physical',observedAt:now,timeWindow:null,reliability:'member_report',memberConfirmed:true,currentStatus:'current'};v30.hypotheses.h1={hypothesisId:'h1',proposition:'sleep affects energy',linkedConstructIds:['SLEEP_QUALITY'],linkedDimensionIds:['physical'],evidenceFor:['ev:sleep'],evidenceAgainst:[],status:'generated',confirmationStatus:'not_required',createdAt:now,lastDerivedAt:now};v30.goals.g1={goalId:'g1',label:'sleep better'};v30.constraints.c1={constraintId:'c1',type:'schedule'};v30.memberContext.preferences={mode:'low_friction'};v30.memberContext.capacity='low';v30.focusDecisions.SLEEP_QUALITY={constructId:'SLEEP_QUALITY',decision:'postponed',decidedAt:now,reasonCodes:['not_now'],constraintRefs:['c1']};v30.activeFocusIds=['SLEEP_QUALITY'];v30.activePlanRef={planId:'plan-current',version:'4.0.0'};v30.activeActionIds=['ACT000001'];v30.reviewCycles=[{reviewId:'r1'}];v30.historyRefs=['history:12'];
const migratedV30=normalizeMemberState(v30,{now});
assert.equal(migratedV30.migrated,true);assert.equal(migratedV30.sourceSchemaVersion,'3.0.0');assert.equal(migratedV30.state.schemaVersion,MEMBER_STATE_SCHEMA_VERSION);assert.equal(migratedV30.state.revision,12);assert.deepEqual(migratedV30.state.constructs,v30.constructs);assert.deepEqual(migratedV30.state.facts,v30.facts);assert.deepEqual(migratedV30.state.hypotheses,v30.hypotheses);assert.deepEqual(migratedV30.state.goals,v30.goals);assert.deepEqual(migratedV30.state.constraints,v30.constraints);assert.deepEqual(migratedV30.state.memberContext,v30.memberContext);assert.deepEqual(migratedV30.state.activePlanRef,v30.activePlanRef);assert.deepEqual(migratedV30.state.activeActionIds,v30.activeActionIds);assert.deepEqual(migratedV30.state.reviewCycles,v30.reviewCycles);assert.deepEqual(migratedV30.state.historyRefs,v30.historyRefs);assert.equal(migratedV30.state.focusDecisions.SLEEP_QUALITY.decision,'deferred');assert.deepEqual(migratedV30.state.activeFocusIds,[]);assert.ok(migratedV30.notes.some(note=>note.includes('3.0.0')));

console.log('Legacy Member State v1/v2 and canonical v3.0 normalize to current governed schema without current-shape data loss');
