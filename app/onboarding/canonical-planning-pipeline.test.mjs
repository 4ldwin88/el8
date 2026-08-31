import test from 'node:test';
import assert from 'node:assert/strict';
import {createDiscoveryFromSnapshot,discoveryPrioritizationInput,planningHandoffFromDiscovery,buildOnboardingPlan} from './canonical-planning-pipeline.js';
import {appendObservation,setResolution} from '../../intelligence/discovery/discovery-controller.js';

const snapshot=(constructIds,feasibility={})=>({constructIds,signals:{feasibility},uncertainty:{requiresDiscoveryConfirmation:constructIds.length>0}});
function establish(session,constructId,{importance='high'}={}){
 appendObservation(session,{constructId,questionId:`discovery-${constructId}`,effects:[{type:'evidence',target:constructId,polarity:'supports',strength:.9},{type:'importance',target:constructId,value:importance}]});
 setResolution(session,constructId,'sufficient',{driverKnown:true});
 return session;
}

test('no construct requiring confirmation does not create Discovery',()=>{assert.equal(createDiscoveryFromSnapshot(snapshot([])),null)});
test('snapshot feasibility preserves uncertainty instead of defaulting to medium',()=>{const s=createDiscoveryFromSnapshot(snapshot(['PHYSICAL_CONDITION']));assert.equal(s.facts.snapshotFeasibility.capacity,'unknown')});
test('resolved construct becomes canonical Prioritization candidate without translation',()=>{const s=establish(createDiscoveryFromSnapshot(snapshot(['SLEEP_QUALITY'])),'SLEEP_QUALITY');const h=discoveryPrioritizationInput(s,{memberStateRevision:2});assert.deepEqual(h.candidates.map(x=>x.constructId),['SLEEP_QUALITY']);assert.equal(h.candidates[0].evidenceConfidence,.9);assert.ok(h.candidates[0].planningContract)});
test('valid Focus without a generic treatment remains a Prioritization candidate',()=>{const s=establish(createDiscoveryFromSnapshot(snapshot(['ENERGY_FUNCTION'])),'ENERGY_FUNCTION');const h=discoveryPrioritizationInput(s,{memberStateRevision:5});assert.deepEqual(h.candidates.map(x=>x.constructId),['ENERGY_FUNCTION']);assert.equal(h.candidates[0].planningContract.disposition,'conditional_action')});
test('held Action availability does not suppress a valid Focus upstream',()=>{const s=establish(createDiscoveryFromSnapshot(snapshot(['RELATIONSHIP_STRAIN'])),'RELATIONSHIP_STRAIN');const h=discoveryPrioritizationInput(s,{memberStateRevision:6});assert.deepEqual(h.candidates.map(x=>x.constructId),['RELATIONSHIP_STRAIN']);assert.ok(h.candidates[0].planningContract)});
test('resolved Discovery construct reaches Prioritization directly',()=>{const s=establish(createDiscoveryFromSnapshot(snapshot(['SLEEP_QUALITY'])),'SLEEP_QUALITY');const h=planningHandoffFromDiscovery(s,{memberStateRevision:2});assert.equal(h.prioritization.recommended[0].constructId,'SLEEP_QUALITY');assert.equal(h.prioritization.memberStateRevision,2)});
test('full onboarding chain requires member Focus confirmation before Planning',()=>{const s=establish(createDiscoveryFromSnapshot(snapshot(['SLEEP_QUALITY'])),'SLEEP_QUALITY');const out=buildOnboardingPlan({session:s,memberStateRevision:3,focusDecisions:[{constructId:'SLEEP_QUALITY',decision:'accepted'}]});assert.equal(out.confirmation.accepted[0].constructId,'SLEEP_QUALITY');assert.equal(out.plan.status,'proposed');assert.ok(out.plan.proposedActions.length>=1);assert.ok(out.plan.proposedActions.every(x=>!('intervention_id'in x)&&!('problem_id'in x)))});
