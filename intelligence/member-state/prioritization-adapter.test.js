'use strict';
const assert=require('node:assert/strict');const test=require('node:test');
const{createMemberState}=require('./member-state');const{applyMemberStateUpdate}=require('./member-state-update');const{projectPrioritizationCandidates}=require('./prioritization-adapter');
const at='2026-08-27T17:00:00.000Z';
function add(s,p){return applyMemberStateUpdate(s,{type:'PROBLEM_UPDATED',payload:p,source:'discovery',at,expectedRevision:s.revision})}

test('only explicitly supported problems are eligible for Prioritization',()=>{let s=createMemberState({memberId:'T0001',now:at});for(const p of [{id:'problem:sleep',status:'SUPPORTED',evidenceRefs:['e1']},{id:'problem:money',status:'UNRESOLVED'},{id:'problem:work',status:'DEFERRED'},{id:'problem:social',status:'CONTRADICTED'}])s=add(s,p);const x=projectPrioritizationCandidates(s);assert.deepEqual(x.supportedProblemIds,['problem:sleep']);assert.equal(x.excluded.length,3);assert.equal(x.memberStateRevision,s.revision)});
test('confidence cannot make an unresolved problem eligible',()=>{let s=createMemberState({memberId:'T0001'});s=add(s,{id:'problem:sleep',status:'UNRESOLVED',confidence:1,evidenceRefs:['e1']});assert.equal(projectPrioritizationCandidates(s).candidates.length,0)});
test('deferred and contradicted problems remain visible with exclusion reason',()=>{let s=createMemberState({memberId:'T0001'});s=add(s,{id:'problem:money',status:'DEFERRED'});s=add(s,{id:'problem:sleep',status:'CONTRADICTED'});const x=projectPrioritizationCandidates(s);assert.deepEqual(x.excluded.map(e=>e.reason),['discovery_deferred','not_supported'])});
