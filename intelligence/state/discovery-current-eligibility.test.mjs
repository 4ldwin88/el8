import test from 'node:test';
import assert from 'node:assert/strict';
import {discoveryOutputToMemberState,memberStateToPrioritizationInput} from './discovery-member-state-adapter.js';
import {toPersistedMemberState,fromPersistedMemberState} from './supabase-persistence.js';
const at='2026-09-10T16:30:00.000Z';
const item={constructId:'SLEEP_QUALITY',status:'supported',resolutionState:'sufficient',evidenceRefs:['e:1'],qualitativeConfidence:'MODERATE',unresolvedReasons:[],uncertaintyRefs:['u:1']};
const project=(states,existingState)=>discoveryOutputToMemberState({states},{memberId:'member:test',existingState,at});
const reload=s=>fromPersistedMemberState(toPersistedMemberState(s));
test('explicit newer inactive or unresolved Discovery state cannot inherit earlier eligibility',()=>{
 const initial=project([item]);
 for(const patch of [{resolutionState:'deferred'},{resolutionState:'nonIssue'},{resolutionState:'escalated'},{excluded:true},{status:'unknown'},{status:'contradicted'},{status:'insufficient'},{resolutionState:'triaged'},{evidenceRefs:[]}]){
  const current={...item,...patch},next=reload(project([current],initial));
  assert.deepEqual(memberStateToPrioritizationInput(next).candidates,[],JSON.stringify(patch));
  assert.equal(next.revision,initial.revision+1);
  assert.deepEqual(next.constructs.SLEEP_QUALITY.evidenceRefs,current.evidenceRefs);
  assert.deepEqual(next.constructs.SLEEP_QUALITY.uncertaintyRefs,current.uncertaintyRefs);
  assert.equal(next.constructs.SLEEP_QUALITY.evidenceConfidence,'MODERATE');
  assert.deepEqual(next.focusDecisions,initial.focusDecisions);
 }
 assert.equal(memberStateToPrioritizationInput(initial).candidates.length,1,'input state remains untouched');
});
test('exclusion and deferral remain separate from evidence assessment and can be explicitly superseded',()=>{
 const initial=project([item]),excluded=reload(project([{...item,excluded:true}],initial));
 assert.equal(excluded.constructs.SLEEP_QUALITY.sufficiency,'sufficient');
 assert.equal(excluded.constructs.SLEEP_QUALITY.discoveryHandoff.excluded,true);
 const deferred=reload(project([{...item,resolutionState:'deferred'}],initial));
 assert.equal(deferred.constructs.SLEEP_QUALITY.sufficiency,'unknown');
 assert.equal(deferred.constructs.SLEEP_QUALITY.discoveryHandoff.resolutionState,'deferred');
 for(const previous of [excluded,deferred]){
  const active=reload(project([item],previous));
  assert.equal(memberStateToPrioritizationInput(active).candidates.length,1);
  assert.equal(active.constructs.SLEEP_QUALITY.discoveryHandoff.excluded,false);
 }
});
test('an omitted construct is not silently retracted and historical facts survive explicit updates',()=>{
 const other={...item,constructId:'FINANCIAL_STRAIN'};
 const initial=project([item,other]);
 const fact={factId:'f:1',semanticKey:'reported',value:{answer:'original'},sourceType:'member',sourceRef:'r:1',observedAt:at,currentStatus:'current'};
 initial.facts[fact.factId]=fact;
 const next=reload(project([{...item,status:'unknown',resolutionState:'triaged'}],initial));
 assert.deepEqual(memberStateToPrioritizationInput(next).candidates.map(x=>x.constructId),['FINANCIAL_STRAIN']);
 assert.deepEqual(next.constructs.FINANCIAL_STRAIN,initial.constructs.FINANCIAL_STRAIN);
 assert.deepEqual(next.facts,initial.facts);
});
test('malformed explicit construct records fail rather than preserving stale eligibility',()=>{
 const initial=project([item]);
 for(const invalid of [null,{}, {...item,constructId:'not-governed'},{...item,status:'made-up'}])assert.throws(()=>project([invalid],initial));
});
