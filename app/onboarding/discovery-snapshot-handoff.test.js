import test from 'node:test';
import assert from 'node:assert/strict';
import {buildDiscoverySnapshotHandoff} from './discovery-snapshot-handoff.js';

test('positive opening indicator suppresses generic concern inference',()=>{
 const h=buildDiscoverySnapshotHandoff({candidate_concerns:['focus'],indicator_signals:{focus_motivation:{label:'Focus & motivation',value:4,concerns:['focus'],dimension:'Intellectual'}}});
 assert.ok(!h.candidateConcerns.includes('focus'));
 assert.ok(h.signals.suppressedPositiveConcerns.includes('focus'));
});

test('explicit low signal can reopen a concern despite another positive signal',()=>{
 const h=buildDiscoverySnapshotHandoff({candidate_concerns:['focus'],indicator_signals:{focus_motivation:{value:4,concerns:['focus']},another_focus_signal:{value:2,concerns:['focus']}}});
 assert.ok(h.candidateConcerns.includes('focus'));
});

test('member priority can reopen a positively rated concern',()=>{
 const h=buildDiscoverySnapshotHandoff({candidate_concerns:['focus'],member_priority_concerns:['focus'],indicator_signals:{focus_motivation:{value:4,concerns:['focus']}}});
 assert.ok(h.candidateConcerns.includes('focus'));
});

test('signal-native opening evidence preserves feasibility without assigning Planning state',()=>{
 const h=buildDiscoverySnapshotHandoff({candidate_concerns:['health'],member_priority_concerns:['health'],feasibility:{time:'<5 min',overall_load:'Difficult'}});
 assert.equal(h.signals.feasibility.time,'<5 min');
 assert.equal(h.signals.feasibility.overall_load,'Difficult');
 assert.ok(h.candidateConcerns.includes('health'));
 assert.equal(h.capacity,undefined);
 assert.equal(h.selectedActionIds,undefined);
 assert.equal(h.candidateActions,undefined);
});

test('no signal-native concern does not manufacture a concern or plan',()=>{
 const h=buildDiscoverySnapshotHandoff({candidate_concerns:[],indicator_signals:{},feasibility:{}});
 assert.deepEqual(h.candidateConcerns,[]);
 assert.equal(h.uncertainty.source,'signal-native');
 assert.equal(h.uncertainty.requiresDiscoveryConfirmation,false);
 assert.equal(h.selectedActionIds,undefined);
});

test('opening evidence never assigns synthetic evidence confidence or obsolete money actions',()=>{
 const h=buildDiscoverySnapshotHandoff({candidate_concerns:['money'],member_priority_concerns:['money'],feasibility:{}});
 assert.equal(h.evidenceConfidence,undefined);
 const serialized=JSON.stringify(h);
 assert.ok(!serialized.includes('2-minute money check-in'));
 assert.ok(!serialized.includes('money-baseline-log'));
 assert.ok(!serialized.includes('condition_baseline'));
 assert.ok(!serialized.includes('baseline_summary'));
});
