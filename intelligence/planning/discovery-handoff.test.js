import test from 'node:test';
import assert from 'node:assert/strict';
import {buildPlanningHandoff,concernToPlanningDriver} from './discovery-handoff.js';
import {buildPlan} from './plan-engine.js';

const state=(extra={})=>({concernId:'poor_sleep',evidenceConfidence:.82,memberImportance:'high',memberPrioritySelected:true,safetyEscalationLevel:0,immediacyClass:'time-sensitive',readiness:2,temporality:'current',specificityFrontier:3,resolutionState:'sufficient',feasibility:{constraints:['late_shift'],supports:['quiet_room'],values:{capacity:'low'},evidenceRefs:['q7']},evidenceRefs:['q1','q7'],...extra});

test('handoff preserves Discovery semantics and performs only explicit normalization',()=>{const x=concernToPlanningDriver(state());assert.equal(x.id,'poor_sleep');assert.equal(x.confidence,.82);assert.equal(x.memberImportance,4);assert.equal(x.memberPrioritySelected,true);assert.equal(x.urgency,3);assert.equal(x.readiness,2);assert.equal(x.temporality,'current');assert.equal(x.specificityFrontier,3);assert.equal(x.feasibility.values.capacity,'low');assert.deepEqual(x.evidenceRefs,['q1','q7'])});

test('immediacy to urgency mapping is deterministic rather than rescored downstream',()=>{assert.equal(concernToPlanningDriver(state({immediacyClass:'routine'})).urgency,1);assert.equal(concernToPlanningDriver(state({immediacyClass:'time-sensitive'})).urgency,3);assert.equal(concernToPlanningDriver(state({immediacyClass:'acute'})).urgency,5);assert.equal(concernToPlanningDriver(state({immediacyClass:null})).urgency,null)});

test('explicit member priority is preserved as a distinct signal',()=>{assert.equal(concernToPlanningDriver(state({memberPrioritySelected:false})).memberPrioritySelected,false);assert.equal(concernToPlanningDriver(state({memberPrioritySelected:true})).memberPrioritySelected,true)});

test('priority result becomes the sole ranked planning input while backlog remains visible',()=>{const h=buildPlanningHandoff({selected:[state()],backlog:[state({concernId:'low_activity',memberPrioritySelected:false})]});assert.equal(h.contractVersion,'discovery-planning-v1');assert.deepEqual(h.ranked.map(x=>x.id),['poor_sleep']);assert.deepEqual(h.discoveryBacklog.map(x=>x.id),['low_activity'])});

test('Discovery feasibility capacity constrains Planning without a second capacity judgment',()=>{const h=buildPlanningHandoff({selected:[state({feasibility:{constraints:[],supports:[],values:{capacity:'low'},evidenceRefs:['q7']}})]});const p=buildPlan(h,{selectionEvidence:{'baseline.sleep_pattern':'5 hours with inconsistent bedtime'}});assert.equal(p.status,'active');assert.equal(p.active.length,1);assert.equal(p.active[0].feasibilityUsed.values.capacity,'low')});

test('Discovery readiness can make an intervention ineligible downstream',()=>{const h=buildPlanningHandoff({selected:[state({concernId:'low_activity',readiness:1,feasibility:{constraints:[],supports:[],values:{capacity:'medium'},evidenceRefs:[]}})]});const p=buildPlan(h,{selectionEvidence:{'baseline.activity_level':'none'}});assert.equal(p.status,'active');assert.ok(p.active.every(a=>a.eligibility.minReadiness<=1))});

test('below-threshold Discovery confidence cannot be promoted by Planning',()=>{const h=buildPlanningHandoff({selected:[state({evidenceConfidence:.4})]});const p=buildPlan(h,{selectionEvidence:{'baseline.sleep_pattern':'5 hours inconsistent'}});assert.equal(p.status,'observe');assert.equal(p.reason,'insufficient_evidence')});
