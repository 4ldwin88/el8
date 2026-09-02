import test from 'node:test';
import assert from 'node:assert/strict';
import { discoveryOutputToMemberState,memberStateToPrioritizationInput } from './discovery-member-state-adapter.js';

const at='2026-09-02T15:00:00.000Z';
function project(item,extra={}){return discoveryOutputToMemberState({trace:{states:[{constructId:'SLEEP_QUALITY',status:'established',resolutionState:'sufficient',evidenceRefs:['e:test'],...item}]},...extra},{memberId:'member:test',at});}

test('Discovery qualitative confidence projects WELL_SUPPORTED into Member State',()=>{
 const state=project({qualitativeConfidence:'WELL_SUPPORTED'});
 assert.equal(state.constructs.SLEEP_QUALITY.evidenceConfidence,'WELL_SUPPORTED');
});

test('obsolete numeric evidenceConfidence cannot manufacture canonical confidence',()=>{
 const state=project({evidenceConfidence:0.8});
 assert.equal(state.constructs.SLEEP_QUALITY.evidenceConfidence,'UNKNOWN');
});

test('qualitative confidence is normalized without changing its category',()=>{
 const state=project({qualitativeConfidence:'moderate'});
 assert.equal(state.constructs.SLEEP_QUALITY.evidenceConfidence,'MODERATE');
});

test('decision-useful handoff candidate remains eligible for Prioritization even when resolution is triaged',()=>{
 const output={trace:{states:[{constructId:'SLEEP_QUALITY',status:'established',resolutionState:'triaged',qualitativeConfidence:'WELL_SUPPORTED',evidenceRefs:['e:test']}]},handoff:{usable:true,candidateIds:['SLEEP_QUALITY']}};
 const state=discoveryOutputToMemberState(output,{memberId:'member:test',at});
 assert.equal(state.constructs.SLEEP_QUALITY.sufficiency,'sufficient');
 assert.deepEqual(memberStateToPrioritizationInput(state).candidates.map(x=>x.constructId),['SLEEP_QUALITY']);
});

test('unresolved construct without a decision-useful handoff remains ineligible for Prioritization',()=>{
 const state=project({resolutionState:'triaged',qualitativeConfidence:'WELL_SUPPORTED'});
 assert.equal(state.constructs.SLEEP_QUALITY.sufficiency,'insufficient');
 assert.equal(memberStateToPrioritizationInput(state).candidates.length,0);
});
