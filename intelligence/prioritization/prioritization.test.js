import assert from 'node:assert/strict';
import { prioritizeCandidates } from './prioritization.js';
const now='2026-08-30T17:30:00.000Z';
const input=candidates=>({memberStateRevision:7,candidates});
{
 const result=prioritizeCandidates(input([{constructId:'PRESSURE_PATTERN',status:'supported',evidenceRefs:['e1']},{constructId:'SLEEP_QUALITY',status:'supported',evidenceRefs:['e2']}]),{now,decisionFactors:{PRESSURE_PATTERN:{urgency:.2,memberImportance:.4},SLEEP_QUALITY:{urgency:.9,memberImportance:.8}}});
 assert.deepEqual(result.recommended.map(x=>x.constructId),['SLEEP_QUALITY','PRESSURE_PATTERN']);
 assert.equal(result.memberStateRevision,7);assert.equal('score'in result.recommended[0],false);assert.ok(result.recommended[0].rationaleCodes.includes('high_urgency'));
}
{
 const result=prioritizeCandidates(input([{constructId:'PRESSURE_PATTERN',status:'supported',evidenceRefs:[]}]),{safetyDisposition:{disposition:'pause_ordinary_flow'},now});
 assert.equal(result.blockedBySafety,true);assert.deepEqual(result.recommended,[]);
}
{
 const result=prioritizeCandidates(input([{constructId:'JOB_SECURITY',status:'supported',evidenceRefs:[]}]),{now,decisionFactors:{JOB_SECURITY:{readiness:.9}}});
 assert.ok(result.recommended[0].rationaleCodes.includes('member_readiness'));
 assert.deepEqual(Object.keys(result.recommended[0].factors).sort(),['leverage','materiality','memberImportance','readiness','urgency'].sort());
 assert.equal(result.recommended[0].factors.urgency,'unknown');
}
console.log('canonical Prioritization tests passed');
