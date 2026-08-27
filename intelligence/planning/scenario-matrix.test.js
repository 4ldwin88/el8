import test from 'node:test';
import assert from 'node:assert/strict';
import {buildPlan} from './plan-engine.js';

const d=(id,extra={})=>({id,confidence:.85,memberImportance:4,urgency:3,readiness:3,...extra});
const scenarios=[
  {name:'financial visibility',driver:'money_pressure',evidence:{'financial.current_snapshot':'Understand where my money is going'},expect:'money_snapshot'},
  {name:'financial obligation',driver:'money_pressure',evidence:{'financial.current_snapshot':'Take action on a specific bill or debt'},expect:'financial_next_step'},
  {name:'income mismatch',driver:'money_pressure',evidence:{'financial.current_snapshot':'Increase income'},status:'observe',reason:'no_eligible_authorized_action'},
  {name:'sleep timing instability',driver:'poor_sleep',evidence:{'baseline.sleep_pattern':'5–6 hours with inconsistent bedtime'},expect:'stabilize_sleep_window'},
  {name:'activity near zero',driver:'low_activity',evidence:{'baseline.activity_level':'No intentional activity'},allowed:['activity_baseline','walk']},
  {name:'work route known',driver:'work_instability',evidence:{'work.current_income_route':'Apply for office and front desk roles'},expect:'income_action'},
  {name:'relationship goal known',driver:'relationship_strain',evidence:{'relationship.repair_goal':'Have one calmer conversation about expectations'},expect:'relationship_repair_step'},
  {name:'support unavailable',driver:'low_support',evidence:{'support.available':'No reliable person available right now'},expect:'support_map'},
  {name:'support available',driver:'low_support',evidence:{'support.available':'Yes, one trusted friend is available'},expect:'support_contact'},
  {name:'environment barrier known',driver:'home_instability',evidence:{'environment.current_barrier':'My workspace is chaotic and unusable'},expect:'home_stability_step'},
  {name:'direction articulated',driver:'lack_direction',evidence:{'values.current_direction':'I want work that gives me stability and autonomy'},expect:'direction_next_step'}
];

for(const s of scenarios)test(`scenario matrix: ${s.name}`,()=>{
  const p=buildPlan({ranked:[d(s.driver)]},{capacity:'low',selectionEvidence:s.evidence});
  if(s.status){assert.equal(p.status,s.status);assert.equal(p.reason,s.reason);assert.equal(p.active.length,0);return}
  assert.equal(p.status,'active');assert.equal(p.active.length,1);assert.equal(p.active[0].driver,s.driver);
  if(s.expect)assert.equal(p.active[0].id,s.expect);if(s.allowed)assert.ok(s.allowed.includes(p.active[0].id));
});

test('every matrix driver stops at the selection gate when its material evidence is absent',()=>{
  for(const s of scenarios.filter(x=>x.driver!=='money_pressure'||x.name==='financial visibility')){
    const p=buildPlan({ranked:[d(s.driver)]},{capacity:'low'});
    assert.equal(p.status,'deepen',`${s.driver} should deepen before selection`);
    assert.ok(p.selectionDeepening?.requirements?.length,`${s.driver} should declare its missing evidence`);
  }
});

test('matrix plans preserve evidence provenance and uncertainty',()=>{
  for(const s of scenarios.filter(x=>!x.status)){
    const p=buildPlan({ranked:[d(s.driver)]},{capacity:'low',selectionEvidence:s.evidence});
    assert.equal(p.evidenceUsed[0].id,s.driver);
    assert.deepEqual(p.selectionEvidence,s.evidence);
    assert.match(p.uncertainty,/hypothesis/i);
  }
});

test('two-driver matrix remains bounded and keeps independent provenance',()=>{
  const p=buildPlan({ranked:[d('poor_sleep',{confidence:.92}),d('low_support',{confidence:.81})]},{capacity:'medium',selectionEvidence:{'baseline.sleep_pattern':'5 hours with inconsistent bedtime','support.available':'Yes, one trusted friend'}});
  assert.equal(p.status,'active');assert.equal(p.active.length,2);assert.deepEqual(new Set(p.active.map(x=>x.driver)),new Set(['poor_sleep','low_support']));
});

test('low capacity matrix never activates more than one intervention',()=>{
  const p=buildPlan({ranked:[d('poor_sleep'),d('low_activity'),d('low_support')]},{capacity:'low',selectionEvidence:{'baseline.sleep_pattern':'5 hours, inconsistent bedtime','baseline.activity_level':'none','support.available':'Yes, trusted friend'}});
  assert.equal(p.status,'active');assert.equal(p.active.length,1);
});
