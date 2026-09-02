import test from 'node:test';
import assert from 'node:assert/strict';
import { discoveryOutputToMemberState } from './discovery-member-state-adapter.js';

const at='2026-09-02T15:00:00.000Z';
function project(item){return discoveryOutputToMemberState({trace:{states:[{constructId:'SLEEP_QUALITY',status:'established',resolutionState:'sufficient',evidenceRefs:['e:test'],...item}]}},{memberId:'member:test',at});}

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
