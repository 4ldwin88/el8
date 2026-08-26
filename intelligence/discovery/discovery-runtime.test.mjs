import test from 'node:test';
import assert from 'node:assert/strict';
import { deriveConcernState } from './concern-projection.js';
import { createObservation } from './contracts.js';
import { evaluateSufficiency } from './sufficiency.js';
import { rankQuestions } from './question-scheduler.js';

test('concern projection accumulates evidence and member priority',()=>{
 const log=[createObservation({questionId:'q1',concernId:'sleep',specificityLevel:1,effects:[{type:'evidence',target:'sleep',polarity:'supports',strength:.5},{type:'member-priority',target:'sleep',value:'selected'}]}),createObservation({questionId:'q2',concernId:'sleep',specificityLevel:2,effects:[{type:'evidence',target:'sleep',polarity:'supports',strength:.3}]})];
 const state=deriveConcernState(log,'sleep'); assert.equal(state.evidenceConfidence,.8); assert.equal(state.memberPrioritySelected,true); assert.equal(state.specificityFrontier,2);
});
test('definitive contradiction excludes a concern',()=>{
 const state=deriveConcernState([createObservation({questionId:'q',concernId:'sleep',effects:[{type:'evidence',target:'sleep',polarity:'contradicts',strength:1,certainty:'definitive'}]})],'sleep'); assert.equal(state.excluded,true); assert.equal(state.evidenceConfidence,0);
});
test('canonical projection carries feasibility constraints and supports',()=>{
 const log=[createObservation({questionId:'q-fit',concernId:'activity',effects:[{type:'feasibility',target:'activity',feasibility:{capacity:'low',scheduleFlexibility:'low'}},{type:'constraint',target:'activity',value:'limited_transport'},{type:'support',target:'activity',value:'partner_support'}]})];
 const state=deriveConcernState(log,'activity'); assert.equal(state.feasibility.values.capacity,'low'); assert.equal(state.feasibility.values.scheduleFlexibility,'low'); assert.deepEqual(state.feasibility.constraints,['limited_transport']); assert.deepEqual(state.feasibility.supports,['partner_support']); assert.ok(state.feasibility.evidenceRefs.every(x=>x==='q-fit'));
});
test('sufficiency respects exclusion and specificity',()=>{
 assert.equal(evaluateSufficiency({excluded:true}).sufficient,true);
 assert.equal(evaluateSufficiency({evidenceConfidence:.8,specificityFrontier:2,temporality:'current'}).sufficient,true);
});
test('scheduler prefers member priority and unresolved concerns',()=>{
 const qs=[{id:'a',concernId:'a',specificityLevel:1},{id:'b',concernId:'b',specificityLevel:1}];
 const states=[{concernId:'a',memberPrioritySelected:false,evidenceConfidence:.2,specificityFrontier:0},{concernId:'b',memberPrioritySelected:true,evidenceConfidence:.2,specificityFrontier:0}];
 const ranked=rankQuestions(qs,states,new Set()); assert.equal(ranked[0].id,'b');
});
