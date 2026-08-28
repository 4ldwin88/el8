import test from 'node:test';
import assert from 'node:assert/strict';
import {deriveConcernState} from './concern-projection.js';

function observation(questionId,effect){return{questionId,concernId:'sleep',effects:[{type:'evidence',target:'sleep',...effect}]}}

test('later member correction replaces an earlier contradiction for the same construct',()=>{
 const state=deriveConcernState([
  observation('Q1',{evidenceKey:'sleep-current',polarity:'contradicts',certainty:'definitive'}),
  observation('Q2',{evidenceKey:'sleep-current',polarity:'supports',certainty:'direct'})
 ],'sleep');
 assert.equal(state.excluded,false);
 assert.deepEqual(state.evidenceSummary.contradicts,[]);
 assert.deepEqual(state.evidenceSummary.supports,['Q2']);
});

test('later contradiction replaces earlier support for the same construct',()=>{
 const state=deriveConcernState([
  observation('Q1',{evidenceKey:'sleep-current',polarity:'supports',certainty:'direct'}),
  observation('Q2',{evidenceKey:'sleep-current',polarity:'contradicts',certainty:'definitive'})
 ],'sleep');
 assert.equal(state.excluded,true);
 assert.deepEqual(state.evidenceSummary.supports,[]);
 assert.deepEqual(state.evidenceSummary.contradicts,['Q2']);
});

test('explicit retraction removes the current evidence for a construct',()=>{
 const state=deriveConcernState([
  observation('Q1',{evidenceKey:'sleep-current',polarity:'contradicts',certainty:'definitive'}),
  observation('Q2',{evidenceKey:'sleep-current',polarity:'neutral',currentStatus:'retracted'})
 ],'sleep');
 assert.equal(state.excluded,false);
 assert.deepEqual(state.evidenceSummary.supports,[]);
 assert.deepEqual(state.evidenceSummary.contradicts,[]);
 assert.deepEqual(state.evidenceSummary.neutral,[]);
});

test('independent current constructs can retain conflicting evidence without manufacturing exclusion',()=>{
 const state=deriveConcernState([
  observation('Q1',{evidenceKey:'sleep-duration',polarity:'contradicts',certainty:'definitive'}),
  observation('Q2',{evidenceKey:'sleep-quality',polarity:'supports',certainty:'direct'})
 ],'sleep');
 assert.equal(state.excluded,false);
 assert.deepEqual(state.evidenceSummary.contradicts,['Q1']);
 assert.deepEqual(state.evidenceSummary.supports,['Q2']);
});
