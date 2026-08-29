import assert from 'node:assert/strict';
import { prioritizeCandidates } from './prioritization.js';
const now='2026-08-27T17:30:00.000Z';
const input=(candidates)=>({memberStateRevision:7,supportedProblemIds:candidates.map(c=>c.problemId),candidates,excluded:[]});
{
 const result=prioritizeCandidates(input([{problemId:'problem:stress',evidenceRefs:['e1']},{problemId:'problem:poor_sleep',evidenceRefs:['e2']}]),{now,decisionFactors:{'problem:stress':{urgency:'low',memberImportance:'moderate'},'problem:poor_sleep':{urgency:'high',memberImportance:'high'}}});
 assert.deepEqual(result.priorityItems.map(x=>x.problemId),['problem:poor_sleep','problem:stress']);
 assert.equal(result.memberStateRevision,7);assert.equal('score'in result.priorityItems[0],false);assert.ok(result.priorityItems[0].rationaleCodes.includes('high_urgency'));
}
{
 const result=prioritizeCandidates(input([{problemId:'problem:stress',evidenceRefs:[]}]),{safetyDisposition:{disposition:'pause_ordinary_flow'},now});
 assert.equal(result.blockedBySafety,true);assert.deepEqual(result.priorityItems,[]);
}
{
 const result=prioritizeCandidates(input([{problemId:'problem:work',evidenceRefs:[]}]),{now,decisionFactors:{'problem:work':{readiness:'present'}}});
 assert.ok(result.priorityItems[0].rationaleCodes.includes('member_readiness'));
 assert.deepEqual(Object.keys(result.priorityItems[0].decisionFactors).sort(),['leverage','materiality','memberImportance','readiness','urgency'].sort());
 assert.equal(result.priorityItems[0].decisionFactors.urgency,null);
 assert.equal(result.priorityItems[0].decisionFactors.materiality,null);
 assert.equal(result.priorityItems[0].decisionFactors.memberImportance,null);
 assert.equal(result.priorityItems[0].decisionFactors.leverage,null);
}
{
 // Unknown evidence must not be silently converted to a neutral value that can outrank
 // explicit low evidence. With no comparable shared factor, deterministic ID order wins.
 const result=prioritizeCandidates(input([{problemId:'problem:stress',evidenceRefs:[]},{problemId:'problem:poor_sleep',evidenceRefs:[]}]),{now,decisionFactors:{'problem:stress':{urgency:'low'}}});
 assert.equal(result.priorityItems.find(x=>x.problemId==='problem:poor_sleep').decisionFactors.urgency,null);
 assert.deepEqual(result.priorityItems.map(x=>x.problemId),['problem:poor_sleep','problem:stress']);
}
{
 // Once the same qualitative factor is established for both candidates it is decision evidence.
 const result=prioritizeCandidates(input([{problemId:'problem:stress',evidenceRefs:[]},{problemId:'problem:poor_sleep',evidenceRefs:[]}]),{now,decisionFactors:{'problem:stress':{urgency:'low'},'problem:poor_sleep':{urgency:'high'}}});
 assert.deepEqual(result.priorityItems.map(x=>x.problemId),['problem:poor_sleep','problem:stress']);
}
{
 assert.throws(()=>prioritizeCandidates(input([{problemId:'problem:stress',evidenceRefs:[]}]),{now,decisionFactors:{'problem:stress':{urgency:.9}}}),/must be qualitative/);
}
console.log('canonical Prioritization tests passed');
