import assert from 'node:assert/strict';
import {buildCanonicalBrowserPriorities,prioritizationDecisionFactorsFromDiscovery} from '../onboarding/canonical-browser-prioritization.js';
import {projectOnboardingMemberState} from '../onboarding/member-state-projection.js';

const state=(problems,safety={disposition:'ORDINARY_FLOW'})=>({revision:7,problems,safety});
const problem=(id,{status='SUPPORTED',confidence=null,evidenceRefs=[`e:${id}`]}={})=>({id,status,confidence,evidenceRefs});

// These are internal canonical Intelligence profiles. They exercise the same production
// Discovery → Member State → Prioritization boundary used by onboarding; they are not an
// external-test snapshot or a parallel prioritization implementation.
{
 const out=buildCanonicalBrowserPriorities({memberState:state([problem('problem:poor_sleep',{status:'UNRESOLVED'}),problem('problem:stress',{status:'CONTRADICTED'})]),discoveryOutput:{trace:{states:[]}}});
 assert.equal(out.input.candidates.length,0);assert.equal(out.result.priorityItems.length,0);
}
{
 const memberState=state([problem('problem:poor_sleep'),problem('problem:financial_strain')]);
 const discoveryOutput={trace:{states:[{concernId:'poor_sleep',memberImportance:1},{concernId:'money_pressure',memberImportance:3}]}};
 const out=buildCanonicalBrowserPriorities({memberState,discoveryOutput});
 assert.equal(out.result.priorityItems[0].problemId,'problem:financial_strain');
 assert.ok(out.result.priorityItems[0].rationaleCodes.includes('member_importance'));
}
{
 const memberState=state([problem('problem:execution_gap'),problem('problem:poor_sleep')]);
 const discoveryOutput={trace:{states:[{concernId:'low_focus',memberImportance:2,crossDimensionalLeverage:'high'},{concernId:'poor_sleep',memberImportance:2,crossDimensionalLeverage:'low'}]}};
 const out=buildCanonicalBrowserPriorities({memberState,discoveryOutput});
 assert.equal(out.result.priorityItems[0].problemId,'problem:execution_gap');
 assert.ok(out.result.priorityItems[0].rationaleCodes.includes('shared_driver_leverage'));
}
{
 const factors=prioritizationDecisionFactorsFromDiscovery({trace:{states:[{concernId:'poor_sleep',materiality:'moderate'}]}});
 assert.deepEqual(factors['problem:poor_sleep'],{materiality:'moderate'});
}
{
 const discoveryOutput={trace:{states:[
  {concernId:'poor_sleep',problemId:'problem:poor_sleep',evidenceRefs:['e:sleep'],memberImportance:2},
  {concernId:'novel_unmapped_concern',evidenceRefs:['e:unknown'],memberImportance:3,crossDimensionalLeverage:'very-high'},
  {concernId:'another_unknown',problemId:'problem:novel_unmapped',evidenceRefs:['e:unknown-canonical'],memberImportance:3}
 ]}};
 const memberState=projectOnboardingMemberState({memberId:'T-UNKNOWN',discoveryOutput,now:'2026-08-28T00:00:00.000Z'});
 assert.deepEqual(memberState.problems.map(x=>x.id),['problem:poor_sleep']);
 assert.ok(memberState.evidence.some(x=>x.id==='e:unknown'));
 const factors=prioritizationDecisionFactorsFromDiscovery(discoveryOutput);
 assert.deepEqual(Object.keys(factors),['problem:poor_sleep']);
 const out=buildCanonicalBrowserPriorities({memberState,discoveryOutput});
 assert.deepEqual(out.input.candidates.map(x=>x.problemId),['problem:poor_sleep']);
 assert.deepEqual(out.result.priorityItems.map(x=>x.problemId),['problem:poor_sleep']);
}
{
 const out=buildCanonicalBrowserPriorities({memberState:state([problem('problem:poor_sleep')],{disposition:'pause_ordinary_flow'}),decisionFactors:{'problem:poor_sleep':{memberImportance:'very-high',urgency:'present',materiality:'high',leverage:'high',readiness:'present'}}});
 assert.equal(out.result.blockedBySafety,true);assert.equal(out.result.priorityItems.length,0);
}

console.log('internal canonical Intelligence Discovery→Prioritization profile regressions passed');
