import assert from 'node:assert/strict';
import test from 'node:test';
import {assertPlanReadyForActivation,canonicalInterventions} from './activation-readiness.js';

const activePlan=()=>({status:'active',registry_version:'test',active:[{id:'I1',intervention_id:'I1',priorityId:'priority:sleep',problemId:'problem:poor_sleep',title:'Sleep action',purpose:'ACT',rationale:'Test',effort:1,measurement:{type:'check'},reviewRule:{window:'7 days'}}]});

test('canonical active plan projects activation interventions without legacy concern ids',()=>{const x=canonicalInterventions(activePlan());assert.equal(x[0].source,'canonical-planning');assert.equal(x[0].problemId,'problem:poor_sleep');assert.equal(x[0].priorityId,'priority:sleep')});
test('active canonical plan is activation ready',()=>{assert.equal(assertPlanReadyForActivation(activePlan()).length,1)});
test('safety override cannot activate',()=>{assert.throws(()=>assertPlanReadyForActivation({status:'escalate',reason:'safety_override'}),/Safety clarification/)});
test('selection deepening cannot activate',()=>{assert.throws(()=>assertPlanReadyForActivation({status:'deepen',reason:'selection_evidence_required',selectionDeepening:{required:true}}),/active canonical plan|intervention-selection evidence/)});
test('plan-specific blocking deepening cannot activate',()=>{const p=activePlan();p.deepening={blocking:[{actionId:'I1'}],requirements:[{actionId:'I1'}]};p.activationStatus='needs_plan_specific_assessment';assert.throws(()=>assertPlanReadyForActivation(p),/plan-specific assessment/)});
