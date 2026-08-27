import test from 'node:test';
import assert from 'node:assert/strict';
import {initialPlanFromBaseline} from './initial-plan-bridge.js';
import {createDiscoveryFromBaseline,planningHandoffFromDiscovery} from './canonical-planning-pipeline.js';
import {appendObservation,setResolution} from '../../intelligence/discovery/discovery-controller.js';
import {buildPlan} from '../../intelligence/planning/plan-engine.js';

const baseline=()=>initialPlanFromBaseline({condition_baseline:{Financial:'Struggling'},member_priority:'Financial',functional_impact:['Financial'],worsening:['Financial'],feasibility:{time:'<5 min',overall_load:'Difficult'}});

test('Baseline alone cannot activate an intervention',()=>{const b=baseline();assert.equal(b.status,'requires_discovery_handoff');assert.equal(b.selectedActionIds.length,0);assert.equal(b.candidateActions.length,0)});

test('Baseline seed creates canonical Discovery session with member and feasibility context',()=>{const s=createDiscoveryFromBaseline(baseline());assert.ok(s);assert.deepEqual(s.concernIds,['money']);assert.equal(s.facts.memberPriorityConcern,'money');assert.equal(s.facts.baselineDimension,'Financial');assert.equal(s.facts.baselineFeasibility.capacity,'low')});

test('unclear Baseline does not fabricate a Discovery session',()=>{const b=initialPlanFromBaseline({condition_baseline:{Physical:'Okay'},member_priority:'No preference'});assert.equal(createDiscoveryFromBaseline(b),null)});

test('Discovery must establish evidence before Planning can activate anything',()=>{const s=createDiscoveryFromBaseline(baseline());setResolution(s,'money','sufficient',{driverKnown:true});const h=planningHandoffFromDiscovery(s);const p=buildPlan(h,{capacity:'low',selectionEvidence:{'financial.current_snapshot':'Understand where my money is going'}});assert.equal(p.status,'observe');assert.equal(p.reason,'insufficient_evidence')});

test('established Discovery evidence can cross handoff but selection evidence still gates action choice',()=>{const s=createDiscoveryFromBaseline(baseline());appendObservation(s,{concernId:'money',signal:'present',evidenceConfidence:.9,memberImportance:'high',memberPrioritySelected:true,immediacyClass:'time-sensitive',readiness:3,evidenceRef:'discovery-money'});setResolution(s,'money','sufficient',{driverKnown:true});const h=planningHandoffFromDiscovery(s);assert.equal(h.ranked[0].id,'money');const gated=buildPlan(h,{capacity:'low'});assert.equal(gated.status,'deepen');assert.equal(gated.reason,'selection_evidence_required')});

test('full canonical path activates only after Discovery and selection evidence',()=>{const s=createDiscoveryFromBaseline(baseline());appendObservation(s,{concernId:'money',signal:'present',evidenceConfidence:.9,memberImportance:'high',memberPrioritySelected:true,immediacyClass:'time-sensitive',readiness:3,evidenceRef:'discovery-money'});setResolution(s,'money','sufficient',{driverKnown:true});const h=planningHandoffFromDiscovery(s);const p=buildPlan(h,{capacity:'low',selectionEvidence:{'financial.current_snapshot':'Understand where my money is going'}});assert.equal(p.status,'active');assert.equal(p.active.length,1);assert.equal(p.active[0].driver,'money');assert.equal(p.active[0].id,'money_snapshot')});
