'use strict';
const assert=require('node:assert/strict');const test=require('node:test');
const{createMemberState}=require('./member-state');const{applyDiscoveryResult}=require('./discovery-adapter');
const at='2026-08-27T15:00:00.000Z';
function base(){return createMemberState({memberId:'T0001',now:at})}

test('Discovery may persist evidence and supported problem conclusions',()=>{const s=base();const n=applyDiscoveryResult(s,{memberStateRevision:0,evidenceRefs:['ev1'],evidence:[{id:'ev1',kind:'MEMBER_REPORT',provenance:'DISCOVERY_ANSWER',recordedAt:at,value:'sleep disrupted'}],problemUpdates:[{id:'problem:sleep-disruption',status:'SUPPORTED',evidenceRefs:['ev1']}],hypothesisUpdates:[],dimensionUpdates:[]},{at});assert.equal(n.evidence.length,1);assert.equal(n.problems[0].id,'problem:sleep-disruption');assert.equal(n.priorities.length,0);assert.equal(n.activePlan.interventions.length,0)});
test('Discovery cannot smuggle prioritization or planning into durable state',()=>{for(const forbidden of [{recommendedPriorities:[]},{plan:{}},{memberPlan:{}},{interventions:[]}]){assert.throws(()=>applyDiscoveryResult(base(),{memberStateRevision:0,evidenceRefs:[],problemUpdates:[],hypothesisUpdates:[],dimensionUpdates:[],...forbidden},{at}),/Discovery cannot persist/)}});
test('Discovery results from a stale Member State revision are rejected',()=>{const s=base();assert.throws(()=>applyDiscoveryResult(s,{memberStateRevision:2,evidenceRefs:[],problemUpdates:[],hypothesisUpdates:[],dimensionUpdates:[]},{at}),/revision conflict/)});
test('cross-dimensional hypotheses must obey canonical revalidation invariants',()=>{const s=base();assert.throws(()=>applyDiscoveryResult(s,{memberStateRevision:0,evidenceRefs:['ev1'],problemUpdates:[],dimensionUpdates:[],hypothesisUpdates:[{id:'hyp1',status:'SUSPECTED',confidence:.5,provenance:['ev1']}]},{at}),/revalidationPolicy/)});
