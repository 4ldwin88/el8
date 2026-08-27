import assert from 'node:assert/strict';
import {REGISTRY,PROBLEMS,INTERVENTIONS,interventionsForProblem} from './problem-intervention-registry.js';

const PURPOSES=new Set(['DEEPEN','ACT','TRACK','LEARN','RESOLVE','CONNECT','ESCALATE']);
assert.equal(REGISTRY.registryVersion,'wave1-0.1');
assert.equal(Object.keys(PROBLEMS).length,8,'Wave 1 must contain exactly eight canonical problem families');
assert.deepEqual(Object.keys(PROBLEMS),['P01','P02','P03','P04','P05','P06','P07','P08']);

for(const [id,p] of Object.entries(PROBLEMS)){
  assert.equal(p.id,id);
  assert.ok(p.key&&p.label);
  assert.ok(p.primaryDimensions.length>0);
  assert.ok(p.interventionIds.length>0,`${id} needs at least one eligible intervention`);
  for(const iid of p.interventionIds) assert.ok(INTERVENTIONS[iid],`${id} references missing ${iid}`);
  for(const h of p.crossDimensionalHypotheses) assert.equal(h.measurementRequired,true,`${id} spillover must require observation`);
}

for(const [id,i] of Object.entries(INTERVENTIONS)){
  assert.equal(i.id,id);
  assert.ok(PURPOSES.has(i.purpose),`${id} has invalid purpose`);
  assert.ok(i.problemIds.length>0);
  assert.ok(i.memberFacingName&&i.evidenceStrength);
  assert.ok(i.measurement?.adherence&&i.measurement?.outcome,`${id} needs adherence + outcome measurement`);
  assert.ok(i.reviewRule?.window&&i.reviewRule?.adapt?.length,`${id} needs an actionable review rule`);
  assert.ok(i.actionTemplates.length>0);
  for(const pid of i.problemIds) assert.ok(PROBLEMS[pid],`${id} references missing ${pid}`);
  for(const alt of i.alternatives) assert.ok(INTERVENTIONS[alt],`${id} references missing alternative ${alt}`);
}

assert.ok(interventionsForProblem('P01').some(x=>x.id==='I01_GRADED_ACTIVITY'));
assert.ok(interventionsForProblem('P03').some(x=>x.purpose==='RESOLVE'));
assert.ok(interventionsForProblem('P07').some(x=>x.purpose==='CONNECT'));
assert.ok(interventionsForProblem('P08').every(x=>x.measurement.outcome.includes('target behavior')||x.measurement.outcome.includes('easier')));

// Guardrails from the research contract.
assert.ok(!Object.values(INTERVENTIONS).some(x=>/generic.*check.?in/i.test(x.actionTemplates.join(' '))));
assert.ok(!Object.values(INTERVENTIONS).some(x=>x.reviewRule.window==='7 days'),'Review timing must not be universally hard-coded to seven days');
console.log('Problem–Intervention–Impact registry contract: PASS');
