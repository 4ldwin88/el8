import test from 'node:test';
import assert from 'node:assert/strict';
import {allLibraryItems,candidatesForDriver} from './intervention-library.js';

const allowedPurposes=new Set(['eligibility','personalization','safety_scope','baseline_measurement','success_criteria','review_timing','outcome_interpretation']);

test('every library action has an explicit measurement and success signal',()=>{
 for(const item of allLibraryItems()){
  assert.ok(item.measurement,`${item.id} missing measurement`);
  assert.ok(item.successSignal,`${item.id} missing successSignal`);
 }
});

test('every deepening requirement is decision-useful and governed',()=>{
 for(const item of allLibraryItems()) for(const r of item.deepeningRequirements||[]){
  assert.ok(r.id&&r.evidenceKey&&r.decisionImpact,`${item.id} has incomplete deepening requirement`);
  assert.ok(allowedPurposes.has(r.purpose),`${item.id}/${r.id} has invalid purpose`);
  assert.notEqual(r.decisionImpact.trim(),'');
 }
});

test('simple evidence-gathering actions do not manufacture extra assessment',()=>{
 for(const id of ['sleep_log','stress_check','energy_observation','focus_pattern_log','activity_baseline','work_barrier_snapshot','money_snapshot','relationship_context_log','support_map','environment_barrier_log','values_prompt']){
  const item=allLibraryItems().find(x=>x.id===id);
  assert.equal(item.deepeningRequirements.length,0,`${id} should begin without a second assessment`);
 }
});

test('candidate copies cannot mutate canonical deepening metadata',()=>{
 const first=candidatesForDriver('poor_sleep');
 first[1].deepeningRequirements[0].evidenceKey='mutated';
 const second=candidatesForDriver('poor_sleep');
 assert.equal(second[1].deepeningRequirements[0].evidenceKey,'baseline.sleep_window');
});
