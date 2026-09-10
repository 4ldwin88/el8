import test from 'node:test';
import assert from 'node:assert/strict';
import {DISCOVERY_CONTRACT_FINGERPRINT} from '../discovery/runtime-fingerprint.js';
// Positive handoff fixtures explicitly assess global requirements; omission is unknown.
const assessed={runId:'11111111-1111-4111-8111-111111111111',contractFingerprint:DISCOVERY_CONTRACT_FINGERPRINT,unresolvedRequirements:[]};
import { discoveryOutputToMemberState,memberStateToPrioritizationInput } from './discovery-member-state-adapter.js';

const at='2026-09-02T15:00:00.000Z';
function project(item,extra={}){return discoveryOutputToMemberState({trace:{...assessed,states:[{constructId:'SLEEP_QUALITY',status:'established',resolutionState:'sufficient',evidenceRefs:['e:test'],...item}]},...extra},{memberId:'member:test',at});}

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

test('canonical runtime {trace,handoff} preserves a triaged candidate without promoting sufficiency',()=>{
 const output={trace:{...assessed,states:[{constructId:'SLEEP_QUALITY',status:'established',resolutionState:'triaged',qualitativeConfidence:'WELL_SUPPORTED',evidenceRefs:['e:test']}]},handoff:{usable:true,candidateIds:['SLEEP_QUALITY']}};
 const state=discoveryOutputToMemberState(output,{memberId:'member:test',at});
 assert.equal(state.constructs.SLEEP_QUALITY.sufficiency,'insufficient');
 assert.deepEqual(Object.keys(state.constructs),['SLEEP_QUALITY']);
 assert.deepEqual(memberStateToPrioritizationInput(state).candidates,[]);
});

test('canonical runtime preserves multiple candidates and their independent sufficiency',()=>{
 const output={trace:{...assessed,states:[
  {constructId:'SLEEP_QUALITY',status:'established',resolutionState:'triaged',qualitativeConfidence:'WELL_SUPPORTED',evidenceRefs:['e:sleep']},
  {constructId:'FINANCIAL_STRAIN',status:'supported',resolutionState:'sufficient',qualitativeConfidence:'MODERATE',evidenceRefs:['e:finance']}
 ]},handoff:{usable:true,candidateIds:['SLEEP_QUALITY','FINANCIAL_STRAIN']}};
 const state=discoveryOutputToMemberState(output,{memberId:'member:test',at});
 assert.deepEqual(Object.keys(state.constructs),['SLEEP_QUALITY','FINANCIAL_STRAIN']);
 assert.equal(state.constructs.SLEEP_QUALITY.sufficiency,'insufficient');
 assert.equal(state.constructs.FINANCIAL_STRAIN.sufficiency,'sufficient');
 assert.deepEqual(memberStateToPrioritizationInput(state).candidates.map(x=>x.constructId),['FINANCIAL_STRAIN']);
});

test('unresolved construct without a decision-useful handoff remains ineligible for Prioritization',()=>{
 const state=project({resolutionState:'triaged',qualitativeConfidence:'WELL_SUPPORTED'});
 assert.equal(state.constructs.SLEEP_QUALITY.sufficiency,'insufficient');
 assert.equal(memberStateToPrioritizationInput(state).candidates.length,0);
});
