import assert from 'node:assert/strict';
import { prioritizeCandidates, PRIORITIZATION_SCHEMA_VERSION,PRIORITIZATION_OUTCOME } from './prioritization.js';

const input={memberStateRevision:5,candidates:[
  {constructId:'FINANCIAL_STRAIN',status:'supported',evidenceRefs:['f1']},
  {constructId:'SLEEP_QUALITY',status:'established',evidenceRefs:['s1']},
  {constructId:'ACTIVITY_LEVEL',status:'supported',evidenceRefs:['a1']},
]};
const result=prioritizeCandidates(input,{decisionFactors:{
  FINANCIAL_STRAIN:{urgency:.9,memberImportance:.8},
  SLEEP_QUALITY:{urgency:.6,memberImportance:.9},
  ACTIVITY_LEVEL:{},
},now:'2026-08-30T15:00:00Z'});
assert.equal(result.schemaVersion,PRIORITIZATION_SCHEMA_VERSION);
assert.equal(result.decisionOutcome,PRIORITIZATION_OUTCOME.CLEAR_DOMINANCE);
assert.deepEqual(result.recommended.map(x=>x.constructId),['FINANCIAL_STRAIN']);
assert.deepEqual(result.alternatives.map(x=>x.constructId),['SLEEP_QUALITY','ACTIVITY_LEVEL']);
assert.equal(result.alternatives[1].factors.urgency,'unknown');
assert.equal(result.alternatives[1].factors.readiness,'unknown');
assert.ok(result.alternatives[1].rationaleCodes.includes('ranking_uncertainty_present'));
assert.equal([...result.recommended,...result.alternatives].some(x=>x.problemId),false);

const deterministic=prioritizeCandidates({memberStateRevision:1,candidates:[
  {constructId:'VALUES_CLARITY',status:'supported'},
  {constructId:'DIRECTION_CLARITY',status:'supported'},
]},{now:'2026-08-30T15:00:00Z'});
assert.equal(deterministic.decisionOutcome,PRIORITIZATION_OUTCOME.NEAR_EQUIVALENT);
assert.deepEqual(deterministic.recommended,[]);
assert.deepEqual(deterministic.alternatives.map(x=>x.constructId),['DIRECTION_CLARITY','VALUES_CLARITY']);
assert.equal(deterministic.alternatives[0].factors.urgency,'unknown');

assert.throws(()=>prioritizeCandidates({memberStateRevision:1,candidates:[{constructId:'money_pressure',status:'supported'}]}),/governed EL8 construct ID/);
assert.throws(()=>prioritizeCandidates({memberStateRevision:1,candidates:[{constructId:'FINANCIAL_STRAIN',status:'hypothesis'}]}),/established or supported/);

const blocked=prioritizeCandidates(input,{safetyDisposition:{disposition:'pause_ordinary_flow'},now:'2026-08-30T15:00:00Z'});
assert.equal(blocked.blockedBySafety,true);assert.deepEqual(blocked.recommended,[]);assert.deepEqual(blocked.alternatives,[]);

console.log('Prioritization preserves legitimate candidates without manufacturing a primary Focus when evidence does not dominate');
