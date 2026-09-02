import test from 'node:test';
import assert from 'node:assert/strict';
import {buildDiscoverySnapshotHandoff} from './discovery-snapshot-handoff.js';

test('positive opening indicator suppresses generic construct inference',()=>{
 const h=buildDiscoverySnapshotHandoff({candidate_construct_ids:['FOCUS_FUNCTION'],indicator_signals:{focus_motivation:{label:'Focus & motivation',value:4,constructIds:['FOCUS_FUNCTION'],dimension:'Intellectual'}}});
 assert.ok(!h.candidateConstructIds.includes('FOCUS_FUNCTION'));
 assert.ok(h.signals.suppressedPositiveConstructIds.includes('FOCUS_FUNCTION'));
});

test('explicit low signal can reopen a construct despite another positive signal',()=>{
 const h=buildDiscoverySnapshotHandoff({candidate_construct_ids:['FOCUS_FUNCTION'],indicator_signals:{focus_motivation:{value:4,constructIds:['FOCUS_FUNCTION']},another_focus_signal:{value:2,constructIds:['FOCUS_FUNCTION']}}});
 assert.ok(h.candidateConstructIds.includes('FOCUS_FUNCTION'));
});

test('member priority can reopen a positively rated construct',()=>{
 const h=buildDiscoverySnapshotHandoff({candidate_construct_ids:['FOCUS_FUNCTION'],member_priority_construct_ids:['FOCUS_FUNCTION'],indicator_signals:{focus_motivation:{value:4,constructIds:['FOCUS_FUNCTION']}}});
 assert.ok(h.candidateConstructIds.includes('FOCUS_FUNCTION'));
});

test('signal-native opening evidence preserves feasibility without assigning Planning state',()=>{
 const h=buildDiscoverySnapshotHandoff({candidate_construct_ids:['PHYSICAL_CONDITION'],member_priority_construct_ids:['PHYSICAL_CONDITION'],feasibility:{time:'<5 min',overall_load:'Difficult'}});
 assert.equal(h.signals.feasibility.time,'<5 min');
 assert.equal(h.signals.feasibility.overall_load,'Difficult');
 assert.ok(h.candidateConstructIds.includes('PHYSICAL_CONDITION'));
 assert.equal(h.capacity,undefined);
 assert.equal(h.selectedActionIds,undefined);
 assert.equal(h.candidateActions,undefined);
});

test('no signal-native construct does not manufacture a construct or plan',()=>{
 const h=buildDiscoverySnapshotHandoff({candidate_construct_ids:[],indicator_signals:{},feasibility:{}});
 assert.deepEqual(h.candidateConstructIds,[]);
 assert.equal(h.uncertainty.source,'signal-native');
 assert.equal(h.uncertainty.requiresDiscoveryConfirmation,false);
 assert.equal(h.selectedActionIds,undefined);
});

test('opening evidence never assigns synthetic evidence confidence or obsolete money actions',()=>{
 const h=buildDiscoverySnapshotHandoff({candidate_construct_ids:['FINANCIAL_STRAIN'],member_priority_construct_ids:['FINANCIAL_STRAIN'],feasibility:{}});
 assert.equal(h.evidenceConfidence,undefined);
 const serialized=JSON.stringify(h);
 assert.ok(!serialized.includes('2-minute money check-in'));
 assert.ok(!serialized.includes('money-baseline-log'));
 assert.ok(!serialized.includes('condition_baseline'));
 assert.ok(!serialized.includes('baseline_summary'));
});

test('legacy signal-native names are translated only at the ingress boundary',()=>{
 const h=buildDiscoverySnapshotHandoff({candidate_concerns:['FOCUS_FUNCTION'],member_priority_concerns:['FOCUS_FUNCTION'],indicator_signals:{focus:{value:2,concerns:['FOCUS_FUNCTION']}},concern_topics:[{concernId:'FOCUS_FUNCTION',topic:'attention'}]});
 assert.deepEqual(h.candidateConstructIds,['FOCUS_FUNCTION']);
 assert.deepEqual(h.signals.memberPriorityConstructIds,['FOCUS_FUNCTION']);
 assert.deepEqual(h.signals.constructTopics,[{constructId:'FOCUS_FUNCTION',topic:'attention'}]);
 assert.equal('candidateConcerns' in h,false);
 assert.equal('priorityConcerns' in h.signals,false);
 assert.equal('concernTopics' in h.signals,false);
});
