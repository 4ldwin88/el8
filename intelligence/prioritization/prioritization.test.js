import assert from 'node:assert/strict';
import { prioritizeCandidates } from './prioritization.js';
const now='2026-08-30T17:30:00.000Z';
const input=candidates=>({memberStateRevision:7,candidates});
{
 const result=prioritizeCandidates(input([{constructId:'PRESSURE_PATTERN',status:'supported',evidenceRefs:['e1']},{constructId:'SLEEP_QUALITY',status:'supported',evidenceRefs:['e2']}]),{now,decisionFactors:{PRESSURE_PATTERN:{urgency:.2,memberImportance:.4},SLEEP_QUALITY:{urgency:.9,memberImportance:.8}}});
 assert.deepEqual(result.recommended.map(x=>x.constructId),['SLEEP_QUALITY']);
 assert.deepEqual(result.alternatives.map(x=>x.constructId),['PRESSURE_PATTERN']);
 assert.ok(result.rationaleCodes.includes('smallest_useful_focus_set'));
 assert.equal(result.memberStateRevision,7);assert.equal('score'in result.recommended[0],false);assert.ok(result.recommended[0].rationaleCodes.includes('high_urgency'));
 assert.equal(result.shadow.role,'Subcon');assert.equal(result.shadow.authoritative,false);assert.equal(typeof result.shadow.ranking[0].score,'number');
}
{
 const result=prioritizeCandidates(input([{constructId:'PRESSURE_PATTERN',status:'supported',evidenceRefs:[]}]),{safetyDisposition:{disposition:'pause_ordinary_flow'},now});
 assert.equal(result.blockedBySafety,true);assert.deepEqual(result.recommended,[]);assert.deepEqual(result.alternatives,[]);assert.equal(result.shadow,null);
}
{
 const result=prioritizeCandidates(input([{constructId:'JOB_SECURITY',status:'supported',evidenceRefs:[]}]),{now,decisionFactors:{JOB_SECURITY:{readiness:.9}}});
 assert.ok(result.recommended[0].rationaleCodes.includes('member_readiness'));
 assert.deepEqual(result.alternatives,[]);
 assert.deepEqual(Object.keys(result.recommended[0].factors).sort(),['leverage','materiality','memberImportance','readiness','urgency'].sort());
 assert.equal(result.recommended[0].factors.urgency,'unknown');
}
{
 const result=prioritizeCandidates(input([{constructId:'SLEEP_QUALITY',status:'supported',evidenceRefs:['a']},{constructId:'PRESSURE_PATTERN',status:'supported',evidenceRefs:['b']}]),{now,decisionFactors:{SLEEP_QUALITY:{urgency:.61,materiality:.61,memberImportance:.6},PRESSURE_PATTERN:{urgency:.6,materiality:.6,memberImportance:.61}}});
 assert.ok(result.rationaleCodes.includes('member_preference_discriminator'));
 assert.equal(result.recommended.length,1);assert.equal(result.alternatives.length,1);
 assert.ok([...result.recommended,...result.alternatives].every(x=>x.rationaleCodes.includes('near_equivalent_member_preference')));
}
console.log('canonical Prioritization tests passed');
