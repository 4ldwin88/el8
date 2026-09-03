import assert from 'node:assert/strict';
import { prioritizeCandidates,PRIORITIZATION_OUTCOME } from './prioritization.js';
import {createCrossDimensionalHypothesis} from '../state/cross-dimensional-hypothesis.js';
const now='2026-08-30T17:30:00.000Z';
const input=candidates=>({memberStateRevision:7,candidates});
const rel=(overrides={})=>createCrossDimensionalHypothesis({hypothesisId:'financial-pressure-member-1',relationshipId:'REL000013',fromConstructId:'FINANCIAL_STRAIN',toConstructId:'PRESSURE_PATTERN',proposition:'Financial strain may be contributing to current pressure.',linkedConstructIds:['FINANCIAL_STRAIN','PRESSURE_PATTERN'],linkedDimensionIds:['financial','emotional'],evidenceRefs:['e-fin','e-pressure'],sourceType:'discovery_synthesis',sourceRef:'discovery:session-1',confidence:'moderate',observedAt:'2026-08-25T12:00:00Z',revalidateAfter:'2026-09-08T12:00:00Z',...overrides});
{
 const result=prioritizeCandidates(input([{constructId:'PRESSURE_PATTERN',status:'supported',evidenceRefs:['e1']},{constructId:'SLEEP_QUALITY',status:'supported',evidenceRefs:['e2']}]),{now,decisionFactors:{PRESSURE_PATTERN:{urgency:.2,memberImportance:.4},SLEEP_QUALITY:{urgency:.9,memberImportance:.8}}});
 assert.equal(result.decisionOutcome,PRIORITIZATION_OUTCOME.CLEAR_DOMINANCE);assert.deepEqual(result.recommended.map(x=>x.constructId),['SLEEP_QUALITY']);assert.deepEqual(result.alternatives.map(x=>x.constructId),['PRESSURE_PATTERN']);assert.ok(result.rationaleCodes.includes('clear_dominance'));assert.equal(result.memberStateRevision,7);assert.equal('score'in result.recommended[0],false);assert.ok(result.recommended[0].rationaleCodes.includes('high_urgency'));assert.equal(result.shadow.role,'Subcon');assert.equal(result.shadow.authoritative,false);assert.equal(typeof result.shadow.ranking[0].score,'number');
}
{
 const result=prioritizeCandidates(input([{constructId:'PRESSURE_PATTERN',status:'supported',evidenceRefs:[]}]),{safetyDisposition:{disposition:'pause_ordinary_flow'},now});assert.equal(result.blockedBySafety,true);assert.equal(result.decisionOutcome,null);assert.deepEqual(result.recommended,[]);assert.deepEqual(result.alternatives,[]);assert.equal(result.shadow,null);
}
{
 const result=prioritizeCandidates(input([{constructId:'JOB_SECURITY',status:'supported',evidenceRefs:[]}]),{now,decisionFactors:{JOB_SECURITY:{readiness:.9}}});assert.equal(result.decisionOutcome,PRIORITIZATION_OUTCOME.CLEAR_DOMINANCE);assert.ok(result.recommended[0].rationaleCodes.includes('member_readiness'));assert.deepEqual(result.alternatives,[]);assert.deepEqual(Object.keys(result.recommended[0].factors).sort(),['leverage','materiality','memberImportance','readiness','urgency'].sort());assert.equal(result.recommended[0].factors.urgency,'unknown');
}
{
 const result=prioritizeCandidates(input([{constructId:'SLEEP_QUALITY',status:'supported',evidenceRefs:['a']},{constructId:'PRESSURE_PATTERN',status:'supported',evidenceRefs:['b']}]),{now,decisionFactors:{SLEEP_QUALITY:{urgency:.61,materiality:.61,memberImportance:.6},PRESSURE_PATTERN:{urgency:.6,materiality:.6,memberImportance:.61}}});assert.equal(result.decisionOutcome,PRIORITIZATION_OUTCOME.NEAR_EQUIVALENT);assert.ok(result.rationaleCodes.includes('member_preference_discriminator'));assert.equal(result.recommended.length,0);assert.equal(result.alternatives.length,2);assert.ok(result.alternatives.every(x=>x.rationaleCodes.includes('near_equivalent_member_preference')));
}
{
 const candidates=[{constructId:'FINANCIAL_STRAIN',status:'supported',evidenceRefs:['e-fin']},{constructId:'PRESSURE_PATTERN',status:'supported',evidenceRefs:['e-pressure']}];const result=prioritizeCandidates(input(candidates),{now,relationshipHypotheses:[rel()],decisionFactors:{FINANCIAL_STRAIN:{materiality:.7},PRESSURE_PATTERN:{materiality:.7}}});const financial=[...result.recommended,...result.alternatives].find(x=>x.constructId==='FINANCIAL_STRAIN');assert.equal(financial.factors.leverage,.7);assert.ok(financial.rationaleCodes.includes('member_relationship_leverage'));assert.equal(result.relationshipTrace[0].relationshipId,'REL000013');
}
{
 const candidates=[{constructId:'FINANCIAL_STRAIN',status:'supported',evidenceRefs:['e-fin']},{constructId:'PRESSURE_PATTERN',status:'supported',evidenceRefs:['e-pressure']}];const result=prioritizeCandidates(input(candidates),{now,relationshipHypotheses:[],decisionFactors:{FINANCIAL_STRAIN:{leverage:1},PRESSURE_PATTERN:{materiality:.7}}});const financial=[...result.recommended,...result.alternatives].find(x=>x.constructId==='FINANCIAL_STRAIN');assert.equal(financial.factors.leverage,'unknown');assert.equal(result.relationshipTrace.length,0);
}
{
 const result=prioritizeCandidates(input([{constructId:'SLEEP_QUALITY',status:'supported',evidenceRefs:['a']},{constructId:'PRESSURE_PATTERN',status:'supported',evidenceRefs:['b']}]),{now,decisionFactors:{SLEEP_QUALITY:{urgency:.65,materiality:.65,memberImportance:.6},PRESSURE_PATTERN:{urgency:.65,materiality:.65}}});assert.equal(result.decisionOutcome,PRIORITIZATION_OUTCOME.DEEPEN_FOR_DISCRIMINATOR);assert.equal(result.recommended.length,0);assert.ok(result.rationaleCodes.includes('deepen_for_discriminator'));
}
{
 const result=prioritizeCandidates(input([{constructId:'SLEEP_QUALITY',status:'supported',evidenceRefs:['a']},{constructId:'ACTIVITY_LEVEL',status:'supported',evidenceRefs:['b']}]),{now,decisionFactors:{SLEEP_QUALITY:{urgency:.7,materiality:.7,memberImportance:.7,portfolio:true},ACTIVITY_LEVEL:{urgency:.7,materiality:.7,memberImportance:.4,portfolio:true}}});assert.equal(result.decisionOutcome,PRIORITIZATION_OUTCOME.PORTFOLIO);assert.equal(result.recommended.length,2);assert.ok(result.rationaleCodes.includes('smallest_useful_portfolio'));
}
console.log('canonical Prioritization tests passed');
