import test from 'node:test';
import assert from 'node:assert/strict';
import {buildBaselineDiscoveryHandoff} from './baseline-discovery-handoff.js';

test('positive baseline indicator suppresses generic concern inference',()=>{
 const h=buildBaselineDiscoveryHandoff({candidate_concerns:['focus'],indicator_signals:{focus_motivation:{label:'Focus & motivation',value:4,concerns:['focus'],dimension:'Intellectual'}}});
 assert.ok(!h.candidateConcerns.includes('focus'));
 assert.ok(h.signals.suppressedPositiveConcerns.includes('focus'));
});

test('explicit low signal can reopen a concern despite another positive signal',()=>{
 const h=buildBaselineDiscoveryHandoff({candidate_concerns:['focus'],indicator_signals:{focus_motivation:{value:4,concerns:['focus']},another_focus_signal:{value:2,concerns:['focus']}}});
 assert.ok(h.candidateConcerns.includes('focus'));
});

test('member priority can reopen a positively rated concern',()=>{
 const h=buildBaselineDiscoveryHandoff({candidate_concerns:['focus'],member_priority_concerns:['focus'],indicator_signals:{focus_motivation:{value:4,concerns:['focus']}}});
 assert.ok(h.candidateConcerns.includes('focus'));
});

test('legacy baseline seeds Discovery without selecting an intervention',()=>{
 const h=buildBaselineDiscoveryHandoff({condition_baseline:{Financial:'Struggling',Physical:'Okay'},member_priority:'Financial',functional_impact:['Financial'],worsening:['Financial'],feasibility:{time:'5–15 min',overall_load:'Manageable'}});
 assert.ok(h.candidateConcerns.includes('money'));
 assert.ok(h.candidateDimensions.includes('Financial'));
 assert.equal(h.signals.legacy.priority,'Financial');
 assert.equal(h.signals.feasibility.overall_load,'Manageable');
 assert.equal(h.uncertainty.requiresDiscoveryConfirmation,true);
 assert.equal(h.selectedActionIds,undefined);
 assert.equal(h.candidateActions,undefined);
});

test('low capacity remains raw feasibility evidence for downstream Planning',()=>{
 const h=buildBaselineDiscoveryHandoff({condition_baseline:{Physical:'Needs attention'},member_priority:'Physical',feasibility:{time:'<5 min',overall_load:'Difficult'}});
 assert.equal(h.signals.feasibility.time,'<5 min');
 assert.equal(h.signals.feasibility.overall_load,'Difficult');
 assert.ok(h.candidateConcerns.includes('health'));
 assert.equal(h.capacity,undefined);
});

test('unclear legacy baseline does not manufacture a concern or plan',()=>{
 const h=buildBaselineDiscoveryHandoff({condition_baseline:{Physical:'Okay',Emotional:'Okay'},member_priority:'No preference',functional_impact:['None'],worsening:['Unsure'],feasibility:{}});
 assert.deepEqual(h.candidateConcerns,[]);
 assert.equal(h.uncertainty.requiresDiscoveryConfirmation,false);
 assert.equal(h.selectedActionIds,undefined);
});

test('baseline handoff never assigns synthetic evidence confidence or obsolete money actions',()=>{
 const h=buildBaselineDiscoveryHandoff({condition_baseline:{Financial:'Struggling'},member_priority:'Financial',functional_impact:['Financial'],feasibility:{}});
 assert.equal(h.evidenceConfidence,undefined);
 const serialized=JSON.stringify(h);
 assert.ok(!serialized.includes('2-minute money check-in'));
 assert.ok(!serialized.includes('money-baseline-log'));
});
