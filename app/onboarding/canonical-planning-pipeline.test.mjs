import test from 'node:test';
import assert from 'node:assert/strict';
import {buildBaselineDiscoveryHandoff} from './baseline-discovery-handoff.js';
import {createDiscoveryFromBaseline,planningHandoffFromDiscovery} from './canonical-planning-pipeline.js';
import {appendObservation,setResolution} from '../../intelligence/discovery/discovery-controller.js';
import {buildPlan} from '../../intelligence/planning/plan-engine.js';

const baseline=()=>buildBaselineDiscoveryHandoff({condition_baseline:{Financial:'Struggling'},member_priority:'Financial',functional_impact:['Financial'],worsening:['Financial'],feasibility:{time:'<5 min',overall_load:'Difficult'}});
const establishMoney=s=>{appendObservation(s,{concernId:'money',questionId:'discovery-money',effects:[{type:'evidence',target:'money',polarity:'supports',strength:.9},{type:'importance',target:'money',value:'high'},{type:'member-priority',target:'money',value:true},{type:'immediacy',target:'money',value:'time-sensitive'},{type:'readiness',target:'money',value:3}]});setResolution(s,'money','sufficient',{driverKnown:true});return s};

test('Baseline alone cannot activate an intervention',()=>{const b=baseline();assert.ok(b.candidateConcerns.includes('money'));assert.equal(b.selectedActionIds,undefined);assert.equal(b.candidateActions,undefined)});

test('Baseline seed creates canonical Discovery session with member and feasibility context',()=>{const s=createDiscoveryFromBaseline(baseline());assert.ok(s);assert.deepEqual(s.concernIds,['money']);assert.equal(s.facts.memberPriorityConcern,'money');assert.equal(s.facts.baselineDimension,'Financial');assert.equal(s.facts.baselineFeasibility.capacity,'low')});

test('unclear Baseline does not fabricate a Discovery session',()=>{const b=buildBaselineDiscoveryHandoff({condition_baseline:{Physical:'Okay'},member_priority:'No preference'});assert.equal(createDiscoveryFromBaseline(b),null)});

test('Discovery must establish evidence before Planning can activate anything',()=>{const s=createDiscoveryFromBaseline(baseline());setResolution(s,'money','sufficient',{driverKnown:true});const h=planningHandoffFromDiscovery(s);const p=buildPlan(h,{capacity:'low',selectionEvidence:{'financial.current_snapshot':'Understand where my money is going'}});assert.equal(p.status,'observe');assert.equal(p.reason,'insufficient_evidence')});

test('established Discovery evidence translates once and selection evidence still gates action choice',()=>{const h=planningHandoffFromDiscovery(establishMoney(createDiscoveryFromBaseline(baseline())));assert.equal(h.ranked[0].sourceConcernId,'money');assert.equal(h.ranked[0].id,'money_pressure');const gated=buildPlan(h,{capacity:'low'});assert.equal(gated.status,'deepen');assert.equal(gated.reason,'selection_evidence_required')});

test('full canonical path activates only after Discovery and selection evidence',()=>{const h=planningHandoffFromDiscovery(establishMoney(createDiscoveryFromBaseline(baseline())));const p=buildPlan(h,{capacity:'low',selectionEvidence:{'financial.current_snapshot':'Understand where my money is going'}});assert.equal(p.status,'active');assert.equal(p.active.length,1);assert.equal(p.active[0].driver,'money_pressure');assert.equal(p.active[0].id,'money_snapshot')});
