import test from 'node:test';
import assert from 'node:assert/strict';
import {DISCOVERY_CONTRACT_FINGERPRINT} from '../discovery/runtime-fingerprint.js';
// Positive handoff fixtures explicitly assess global requirements; omission is unknown.
const assessed={runId:'11111111-1111-4111-8111-111111111111',contractFingerprint:DISCOVERY_CONTRACT_FINGERPRINT,unresolvedRequirements:[]};
import {discoveryOutputToMemberState,memberStateToPrioritizationInput} from './discovery-member-state-adapter.js';
import {toPersistedMemberState,fromPersistedMemberState} from './supabase-persistence.js';
const at='2026-09-10T16:00:00.000Z';
const item={constructId:'SLEEP_QUALITY',status:'supported',resolutionState:'triaged',qualitativeConfidence:'MODERATE',evidenceRefs:['answer:2','answer:1'],unresolvedReasons:['required current-state distinction missing']};
function project(state,extra={}){return discoveryOutputToMemberState({trace:{...assessed,states:[state]},...extra},{memberId:'member:test',at});}

test('candidate consideration cannot satisfy evidence requirements through any handoff metadata',()=>{
 for(const extra of [{handoff:{usable:true,candidateIds:['SLEEP_QUALITY']}},{stop:{candidateIds:['SLEEP_QUALITY']}},{stoppingDecision:{candidateIds:['SLEEP_QUALITY']}}]){
  const state=project(item,extra),c=state.constructs.SLEEP_QUALITY;
  assert.equal(c.sufficiency,'insufficient');
  assert.deepEqual(c.unresolvedReasons,item.unresolvedReasons);
  assert.equal(c.evidenceConfidence,'MODERATE');
  assert.deepEqual(memberStateToPrioritizationInput(state).candidates,[]);
 }
});

test('explicitly permitted optional uncertainty survives sufficient state and the persistence handoff',()=>{
 const source={...item,resolutionState:'sufficient',unresolvedReasons:['optional contributor unknown'],uncertaintyRefs:['uncertainty:2','uncertainty:1'],provenanceRefs:['source:2','source:1'],memberImportance:'high',memberPriority:'maintain',readiness:'unknown',temporality:'current',relationships:[{source:'STRESS',target:'SLEEP_QUALITY',direction:'unknown',confidence:'unknown',evidenceRefs:['answer:1']}],feasibility:{constraints:['time uncertain'],supports:[],values:{capacity:'unknown'},evidenceRefs:['answer:2']}};
 const state=project(source),restored=fromPersistedMemberState(toPersistedMemberState(state)),input=memberStateToPrioritizationInput(restored),c=input.candidates[0];
 assert.equal(c.evidenceConfidence,'MODERATE');
 for(const key of ['unresolvedReasons','uncertaintyRefs','provenanceRefs','evidenceRefs','memberImportance','memberPriority','readiness','temporality','relationships','feasibility']){
  assert.deepEqual(restored.constructs.SLEEP_QUALITY[key],source[key],key+' persists');
  assert.deepEqual(c[key],source[key],key+' reaches handoff');
 }
 assert.deepEqual(input.uncertaintyRefs,source.uncertaintyRefs);
 source.feasibility.constraints.push('later edit');
 assert.deepEqual(restored.constructs.SLEEP_QUALITY.feasibility.constraints,['time uncertain']);
});

test('empty or insufficient candidate sets do not manufacture a sufficient handoff',()=>{
 const state=project(item),input=memberStateToPrioritizationInput(state);
 assert.ok(state.constructs.SLEEP_QUALITY,'candidate remains visible in canonical state');
 assert.notEqual(input.sufficiency,'sufficient');
 assert.deepEqual(state.constructs.SLEEP_QUALITY.unresolvedReasons,item.unresolvedReasons);
});
