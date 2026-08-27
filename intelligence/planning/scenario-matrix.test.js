import test from 'node:test';
import assert from 'node:assert/strict';
import {buildPlan,LIBRARY} from './plan-engine.js';
import {driverSelectionMode,SELECTION_EVIDENCE,OBSERVATION_ONLY_DRIVERS} from './selection-evidence.js';

const d=(id,extra={})=>({id,confidence:.85,memberImportance:4,urgency:3,readiness:3,...extra});

// Scenario QA intentionally verifies the canonical MVP contract rather than prescribing
// richer selection semantics that are not implemented yet. Selection evidence must gate
// decision-bearing drivers; once present, planning must choose an authorized, bounded action.
const scenarios=[
  {name:'financial visibility',driver:'money_pressure',evidence:{'financial.current_snapshot':'Understand where my money is going'},allowed:['money_snapshot','financial_next_step']},
  {name:'financial obligation',driver:'money_pressure',evidence:{'financial.current_snapshot':'Take action on a specific bill or debt'},allowed:['money_snapshot','financial_next_step']},
  {name:'income need',driver:'money_pressure',evidence:{'financial.current_snapshot':'Increase income'},allowed:['money_snapshot','financial_next_step']},
  {name:'sleep timing instability',driver:'poor_sleep',evidence:{'baseline.sleep_pattern':'5–6 hours with inconsistent bedtime'},allowed:['sleep_log','stabilize_sleep_window']},
  {name:'schedule disruption',driver:'schedule_disruption',evidence:{'schedule.current_pattern':'My wake time and first work block move around every day'},expect:'anchor_daily_schedule'},
  {name:'stress pattern unknown',driver:'stress',evidence:{'stress.current_context':'No — I need to understand the pattern first'},allowed:['stress_check','short_decompression']},
  {name:'stress pattern known',driver:'stress',evidence:{'stress.current_context':'Yes — the pattern is fairly clear'},allowed:['stress_check','short_decompression']},
  {name:'focus pattern unknown',driver:'low_focus',evidence:{'focus.current_pattern':'No — I need to understand the pattern first'},allowed:['focus_pattern_log','protected_focus_block']},
  {name:'focus pattern known',driver:'low_focus',evidence:{'focus.current_pattern':'Yes — the useful pattern is fairly clear'},allowed:['focus_pattern_log','protected_focus_block']},
  {name:'activity near zero',driver:'low_activity',evidence:{'baseline.activity_level':'No intentional activity'},allowed:['activity_baseline','walk','strength_activity']},
  {name:'work route known',driver:'work_instability',evidence:{'work.current_income_route':'Apply for office and front desk roles'},allowed:['work_barrier_snapshot','income_action']},
  {name:'relationship goal known',driver:'relationship_strain',evidence:{'relationship.repair_goal':'Have one calmer conversation about expectations'},allowed:['relationship_context_log','relationship_repair_step']},
  {name:'support unavailable',driver:'low_support',evidence:{'support.available':'No reliable person available right now'},allowed:['support_map','support_contact']},
  {name:'support available',driver:'low_support',evidence:{'support.available':'Yes, one trusted friend is available'},allowed:['support_map','support_contact']},
  {name:'environment barrier known',driver:'home_instability',evidence:{'environment.current_barrier':'My workspace is chaotic and unusable'},allowed:['environment_barrier_log','home_stability_step']},
  {name:'direction articulated',driver:'lack_direction',evidence:{'values.current_direction':'I want work that gives me stability and autonomy'},allowed:['values_prompt','direction_next_step']}
];

for(const s of scenarios)test(`scenario matrix: ${s.name}`,()=>{
  const p=buildPlan({ranked:[d(s.driver)]},{capacity:'low',selectionEvidence:s.evidence});
  assert.equal(p.status,'active');
  assert.equal(p.active.length,1);
  assert.equal(p.active[0].driver,s.driver);
  if(s.expect)assert.equal(p.active[0].id,s.expect);
  if(s.allowed)assert.ok(s.allowed.includes(p.active[0].id),`${p.active[0].id} is not authorized for ${s.driver}`);
});

test('every authorized driver is explicitly classified for selection',()=>{
  const drivers=new Set(Object.keys(LIBRARY));
  for(const id of drivers)assert.notEqual(driverSelectionMode(id),'unclassified',`${id} is not classified`);
  assert.deepEqual([...OBSERVATION_ONLY_DRIVERS].sort(),['low_energy']);
  for(const id of Object.keys(SELECTION_EVIDENCE))assert.ok(drivers.has(id),`${id} has evidence contract but no authorized intervention`);
});

test('every decision-bearing driver stops at selection gate without material evidence',()=>{
  for(const id of Object.keys(SELECTION_EVIDENCE)){
    const p=buildPlan({ranked:[d(id)]},{capacity:'low'});
    assert.equal(p.status,'deepen',`${id} should deepen`);
    assert.ok(p.selectionDeepening?.requirements?.length,`${id} should declare missing evidence`);
  }
});

test('observation-only drivers do not manufacture selection questions',()=>{
  for(const id of OBSERVATION_ONLY_DRIVERS){
    const p=buildPlan({ranked:[d(id)]},{capacity:'low'});
    assert.notEqual(p.status,'deepen');
    assert.equal(p.status,'active');
    assert.equal(p.active[0].driver,id);
    assert.equal(p.active[0].type,'data');
  }
});

test('matrix plans preserve evidence provenance and hypothesis rationale',()=>{
  for(const s of scenarios){
    const p=buildPlan({ranked:[d(s.driver)]},{capacity:'low',selectionEvidence:s.evidence});
    assert.equal(p.evidenceUsed[0].id,s.driver);
    assert.deepEqual(p.selectionEvidence,s.evidence);
    assert.match(p.active[0].rationale,/hypothesis/i);
  }
});

test('two-driver matrix remains bounded and keeps independent provenance',()=>{
  const p=buildPlan({ranked:[d('poor_sleep',{confidence:.92}),d('low_support',{confidence:.81})]},{capacity:'medium',selectionEvidence:{'baseline.sleep_pattern':'5 hours with inconsistent bedtime','support.available':'Yes, one trusted friend'}});
  assert.equal(p.status,'active');
  assert.equal(p.active.length,2);
  assert.deepEqual(new Set(p.active.map(x=>x.driver)),new Set(['poor_sleep','low_support']));
  assert.deepEqual(new Set(p.evidenceUsed.map(x=>x.id)),new Set(['poor_sleep','low_support']));
});

test('low capacity matrix never activates more than one intervention',()=>{
  const p=buildPlan({ranked:[d('poor_sleep'),d('low_activity'),d('low_support')]},{capacity:'low',selectionEvidence:{'baseline.sleep_pattern':'5 hours, inconsistent bedtime','baseline.activity_level':'none','support.available':'Yes, trusted friend'}});
  assert.equal(p.status,'active');
  assert.equal(p.active.length,1);
});
