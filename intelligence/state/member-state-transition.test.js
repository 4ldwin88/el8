import assert from 'node:assert/strict';
import { createMemberState } from './member-state-contract.js';
import { applyMemberStateTransition as apply, MEMBER_STATE_EVENT as E } from './member-state-transition.js';

const at='2026-08-30T13:00:00Z';
let s=createMemberState({memberId:'T0001',now:at});

assert.throws(()=>apply(s,{type:E.MEMBER_CONTEXT_UPDATED,payload:{capacity:'low'},source:'test',at,expectedRevision:9}),/revision conflict/);
s=apply(s,{type:E.MEMBER_CONTEXT_UPDATED,payload:{capacity:null,readiness:null},source:'test',at,expectedRevision:0});
assert.equal(s.memberContext.capacity,'unknown'); assert.equal(s.memberContext.readiness,'unknown');

s=apply(s,{type:E.CONSTRUCT_UPDATED,payload:{constructId:'FINANCIAL_STRAIN',status:'supported',evidenceRefs:['f1']},source:'discovery',at,expectedRevision:1});
assert.ok(s.dimensions.financial.constructIds.includes('FINANCIAL_STRAIN'));

const fact={factId:'f1',semanticKey:'financial.strain',value:true,sourceType:'member_report',sourceRef:'FIN001',observedAt:at,affectedConstructId:'FINANCIAL_STRAIN',affectedDimensionId:'financial',currentStatus:'current'};
s=apply(s,{type:E.FACT_RECORDED,payload:fact,source:'discovery',at,expectedRevision:2});
assert.throws(()=>apply(s,{type:E.FACT_RECORDED,payload:{...fact,value:false},source:'test',at,expectedRevision:3}),/immutable once recorded/);

assert.throws(()=>apply(s,{type:E.PLAN_ACTIVATED,payload:{planId:'p0',focusIds:['FINANCIAL_STRAIN'],actionIds:['FIN-001']},source:'planning',at,expectedRevision:3}),/member accepted/);
s=apply(s,{type:E.FOCUS_DECIDED,payload:{constructId:'FINANCIAL_STRAIN',decision:'accepted',decidedAt:at},source:'member',at,expectedRevision:3});
s=apply(s,{type:E.PLAN_ACTIVATED,payload:{planId:'p1',version:1,focusIds:['FINANCIAL_STRAIN'],actionIds:['FIN-001']},source:'planning',at,expectedRevision:4});
assert.equal(s.activePlanRef.planId,'p1'); assert.deepEqual(s.activeActionIds,['FIN-001']);

s=apply(s,{type:E.FOCUS_DECIDED,payload:{constructId:'FINANCIAL_STRAIN',decision:'deferred',decidedAt:at,reasonCodes:['member_choice']},source:'member',at,expectedRevision:5});
assert.equal(s.focusDecisions.FINANCIAL_STRAIN.decision,'deferred');
assert.equal(s.activeFocusIds.includes('FINANCIAL_STRAIN'),false);
assert.equal(s.activePlanRef.planId,'p1');
assert.equal(s.activePlanRef.reconciliationRequired,true);
assert.equal(s.activePlanRef.reconciliation.reason,'MEMBER_FOCUS_WITHDRAWN');
assert.deepEqual(s.activeActionIds,['FIN-001']);
assert.throws(()=>apply(s,{type:E.FOCUS_DECIDED,payload:{constructId:'FINANCIAL_STRAIN',decision:'postponed',decidedAt:at},source:'member',at,expectedRevision:6}),/Unknown focus decision/);
assert.throws(()=>apply(s,{type:E.FOCUS_DECIDED,payload:{constructId:'FINANCIAL_STRAIN',decision:'paused',decidedAt:at},source:'member',at,expectedRevision:6}),/Unknown focus decision/);

assert.throws(()=>apply(s,{type:E.HYPOTHESIS_UPDATED,payload:{hypothesisId:'h1',proposition:'cost friction contributes',status:'corroborating',evidenceFor:['f1'],evidenceAgainst:[]},source:'discovery',at,expectedRevision:6}),/revalidationPolicy/);
s=apply(s,{type:E.HYPOTHESIS_UPDATED,payload:{hypothesisId:'h1',proposition:'cost friction contributes',status:'corroborating',evidenceFor:['f1'],evidenceAgainst:[],revalidationPolicy:'on_new_evidence',revalidateAfter:'P30D'},source:'discovery',at,expectedRevision:6});
assert.equal(s.hypotheses.h1.revalidationPolicy,'on_new_evidence');

assert.equal(s.revision,7);
console.log('Canonical Member State transitions enforce revision, provenance, Focus and Planning-boundary invariants');
