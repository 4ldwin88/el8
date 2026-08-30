import assert from 'node:assert/strict';
import { prioritizeCandidates } from './prioritization.js';

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
assert.equal(result.schemaVersion,'2.0.0');
assert.deepEqual(result.recommended.map(x=>x.constructId),['FINANCIAL_STRAIN','SLEEP_QUALITY','ACTIVITY_LEVEL']);
assert.equal(result.recommended[2].factors.urgency,'unknown');
assert.equal(result.recommended[2].factors.readiness,'unknown');
assert.ok(result.recommended[2].rationaleCodes.includes('ranking_uncertainty_present'));
assert.equal(result.recommended.some(x=>x.problemId),false);
assert.equal(result.recommended.length,3); // no fixed Primary + Supporting truncation

const deterministic=prioritizeCandidates({memberStateRevision:1,candidates:[
  {constructId:'VALUES_CLARITY',status:'supported'},
  {constructId:'DIRECTION_CLARITY',status:'supported'},
]},{now:'2026-08-30T15:00:00Z'});
assert.deepEqual(deterministic.recommended.map(x=>x.constructId),['DIRECTION_CLARITY','VALUES_CLARITY']);
assert.equal(deterministic.recommended[0].factors.urgency,'unknown');

assert.throws(()=>prioritizeCandidates({memberStateRevision:1,candidates:[{constructId:'money_pressure',status:'supported'}]}),/canonical EL8 construct ID/);
assert.throws(()=>prioritizeCandidates({memberStateRevision:1,candidates:[{constructId:'FINANCIAL_STRAIN',status:'hypothesis'}]}),/established or supported/);

const blocked=prioritizeCandidates(input,{safetyDisposition:{disposition:'pause_ordinary_flow'},now:'2026-08-30T15:00:00Z'});
assert.equal(blocked.blockedBySafety,true);assert.deepEqual(blocked.recommended,[]);

console.log('Prioritization v2 ranks canonical constructs, preserves unknowns and never truncates Focus count');
