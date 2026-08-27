import test from 'node:test';
import assert from 'node:assert/strict';
import {buildPlan} from './plan-engine.js';
import {PROBLEMS,INTERVENTIONS,REGISTRY_VERSION} from './problem-intervention-registry.js';
import {canonicalProblemId,eligibleRegistryInterventions} from './problem-registry-adapter.js';

const d=(id,extra={})=>({id,confidence:.85,memberImportance:4,urgency:3,readiness:3,...extra});

// Scenario QA now verifies the canonical Problem -> mechanism -> intervention contract.
// Legacy driver IDs are accepted only as Discovery inputs; authorization is registry-owned.
const scenarios=[
  {name:'financial visibility',driver:'money_pressure',problem:'P03',evidence:{'financial.current_snapshot':'Understand where my money is going'},mechanism:'visibility_uncertainty',allowed:['I03_MONEY_SNAPSHOT']},
  {name:'financial obligation',driver:'money_pressure',problem:'P03',evidence:{'financial.current_snapshot':'Take action on a specific bill or debt'},mechanism:'obligation_pressure',allowed:['I03_FINANCIAL_NEXT_STEP']},
  {name:'income need',driver:'money_pressure',problem:'P03',evidence:{'financial.current_snapshot':'Increase income'},mechanism:'insufficient_income',allowed:['I03_FINANCIAL_NEXT_STEP']},
  {name:'sleep pattern established',driver:'poor_sleep',problem:'P02',evidence:{'baseline.sleep_pattern':'5–6 hours with inconsistent bedtime'},allowed:['I02_SLEEP_PATTERN_DEEPEN','I02_SLEEP_CARE_ROUTE']},
  {name:'activity near zero',driver:'low_activity',problem:'P01',evidence:{'baseline.activity_level':'No intentional activity'},allowed:['I01_GRADED_ACTIVITY','I01_ACTIVITY_BASELINE']},
  {name:'work route known',driver:'work_instability',problem:'P05',evidence:{'work.current_income_route':'Apply for office and front desk roles'},allowed:['I05_FUNNEL_ACTION','I05_INCOME_EXPERIMENT']},
  {name:'stress context known',driver:'stress',problem:'P06',evidence:{'stress.current_context':'Yes — the pattern is fairly clear'},allowed:['I06_RESOLVE_STRESSOR','I06_COPING_SKILL']},
  {name:'support available',driver:'low_support',problem:'P07',evidence:{'support.available':'Yes, one trusted friend is available'},allowed:['I07_VALUED_CONTACT','I07_RECURRING_CONNECTION','I07_ACCESS_BARRIER']},
  {name:'environment barrier known',driver:'home_instability',problem:'P08',evidence:{'environment.current_barrier':'My workspace is chaotic and unusable'},allowed:['I08_REMOVE_FRICTION','I08_ADD_CUE']}
];

for(const s of scenarios)test(`canonical scenario matrix: ${s.name}`,()=>{
  assert.equal(canonicalProblemId(s.driver),s.problem);
  const p=buildPlan({ranked:[d(s.driver)]},{capacity:'low',selectionEvidence:s.evidence});
  assert.equal(p.status,'active');
  assert.equal(p.active.length,1);
  const c=p.active[0];
  assert.equal(c.problem_id,s.problem);
  assert.equal(c.driver,s.driver);
  assert.equal(c.registry_version,REGISTRY_VERSION);
  assert.ok(s.allowed.includes(c.intervention_id),`${c.intervention_id} is not authorized for ${s.problem}`);
  assert.ok(PROBLEMS[s.problem].interventionIds.includes(c.intervention_id));
  assert.ok(INTERVENTIONS[c.intervention_id].problemIds.includes(s.problem));
  if(s.mechanism)assert.equal(c.selection_mechanism_id,s.mechanism);
  assert.ok(c.purpose);
  assert.ok(c.measurement?.adherence);
  assert.ok(c.measurement?.outcome);
  assert.ok(c.review_rule?.window);
});

test('every canonical problem authorizes real registry interventions',()=>{
  for(const [problemId,p] of Object.entries(PROBLEMS)){
    assert.ok(p.interventionIds.length,`${problemId} has no interventions`);
    for(const interventionId of p.interventionIds){
      assert.ok(INTERVENTIONS[interventionId],`${problemId} references missing ${interventionId}`);
      assert.ok(INTERVENTIONS[interventionId].problemIds.includes(problemId),`${interventionId} does not authorize ${problemId}`);
    }
  }
});

test('mechanism-specific eligibility cannot cross problem boundaries',()=>{
  const xs=eligibleRegistryInterventions('P03',{mechanismId:'visibility_uncertainty'});
  assert.ok(xs.some(x=>x.id==='I03_MONEY_SNAPSHOT'));
  assert.ok(xs.every(x=>x.problemIds.includes('P03')));
  assert.ok(xs.every(x=>!(x.mechanismIds||[]).length||x.mechanismIds.includes('visibility_uncertainty')));
});

test('decision-bearing legacy Discovery inputs still stop at evidence gate',()=>{
  for(const s of scenarios){
    const p=buildPlan({ranked:[d(s.driver)]},{capacity:'low'});
    assert.equal(p.status,'deepen',`${s.driver} should deepen before intervention selection`);
    assert.ok(p.selectionDeepening?.requirements?.length,`${s.driver} should declare missing evidence`);
  }
});

test('matrix plans preserve discovery and registry provenance',()=>{
  for(const s of scenarios){
    const p=buildPlan({ranked:[d(s.driver,{evidenceIds:[`${s.problem}.signal`]})]},{capacity:'low',selectionEvidence:s.evidence});
    const c=p.active[0];
    assert.equal(p.evidenceUsed[0].problem_id,s.problem);
    assert.deepEqual(p.selectionEvidence,s.evidence);
    assert.equal(c.decision_trace.problem_id,s.problem);
    assert.equal(c.decision_trace.intervention_id,c.intervention_id);
    assert.equal(c.decision_trace.registry_version,REGISTRY_VERSION);
    assert.deepEqual(c.decision_trace.discovery_evidence_ids,[`${s.problem}.signal`]);
    assert.match(c.rationale,/evidence|confirmed focus/i);
  }
});

test('two-problem matrix remains bounded and preserves independent problem provenance',()=>{
  const p=buildPlan({ranked:[d('poor_sleep',{confidence:.92}),d('low_support',{confidence:.81})]},{capacity:'medium',selectionEvidence:{'baseline.sleep_pattern':'5 hours with inconsistent bedtime','support.available':'Yes, one trusted friend'}});
  assert.equal(p.status,'active');
  assert.equal(p.active.length,2);
  assert.deepEqual(new Set(p.active.map(x=>x.problem_id)),new Set(['P02','P07']));
  assert.deepEqual(new Set(p.evidenceUsed.map(x=>x.problem_id)),new Set(['P02','P07']));
  assert.deepEqual(new Set(p.decisionTrace.coveredProblems),new Set(['P02','P07']));
});

test('low capacity matrix never activates more than one registry intervention',()=>{
  const p=buildPlan({ranked:[d('poor_sleep'),d('low_activity'),d('low_support')]},{capacity:'low',selectionEvidence:{'baseline.sleep_pattern':'5 hours, inconsistent bedtime','baseline.activity_level':'none','support.available':'Yes, trusted friend'}});
  assert.equal(p.status,'active');
  assert.equal(p.active.length,1);
  assert.ok(p.active[0].intervention_id.startsWith('I'));
});
