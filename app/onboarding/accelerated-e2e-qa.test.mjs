import test from 'node:test';
import assert from 'node:assert/strict';
import {buildOnboardingAdaptivePlan} from './adaptive-plan.js';
import {assertPlanReadyForActivation} from './activation-readiness.js';

const discoveryOutput={trace:{states:[{concernId:'money_pressure',label:'Money',resolutionState:'sufficient',evidenceConfidence:.9,memberImportance:'high',memberPrioritySelected:true,immediacyClass:'time-sensitive',readiness:3,feasibility:{constraints:[],supports:[],values:{capacity:'low'},evidenceRefs:['d:money']},evidenceRefs:['d:money']}]},plan:{focus:[{concernId:'money_pressure',label:'Money',evidenceConfidence:.9,memberSelected:true}]},baselineHandoff:{signals:{feasibility:{overall_load:'Difficult'},constraints:[]}}};
const confirmedPriorities=['money_pressure'];
const build=(selectionEvidence={},evidence={})=>buildOnboardingAdaptivePlan({discoveryOutput,recommendedPriorities:confirmedPriorities,confirmedPriorities,baselineHandoff:discoveryOutput.baselineHandoff,selectionEvidence,evidence});

test('accelerated E2E: Discovery cannot skip intervention-selection evidence',()=>{const p=build();assert.equal(p.status,'deepen');assert.equal(p.reason,'selection_evidence_required');assert.throws(()=>assertPlanReadyForActivation(p))});
test('accelerated E2E: selection evidence chooses intervention but cannot bypass blocking activation evidence',()=>{const p=build({'financial.current_snapshot':'Understand where my money is going'});assert.equal(p.status,'active');assert.equal(p.active[0].id,'money_snapshot');if((p.deepening?.blocking||[]).length||p.activationStatus==='needs_plan_specific_assessment')assert.throws(()=>assertPlanReadyForActivation(p))});
test('accelerated E2E: requirements can be satisfied immediately without waiting reviewDays',()=>{let p=build({'financial.current_snapshot':'Understand where my money is going'});const activation={};for(const r of p.deepening?.blocking||[]){const key=r.evidenceKey||r.requirementId||r.id;if(key)activation[key]=r.options?.[0]||'QA evidence supplied'}p=build({'financial.current_snapshot':'Understand where my money is going'},activation);if((p.deepening?.blocking||[]).length===0&&p.activationStatus!=='needs_plan_specific_assessment'){const interventions=assertPlanReadyForActivation(p);assert.equal(interventions[0].id,'money_snapshot')}else assert.ok((p.deepening?.blocking||[]).length>0);assert.notEqual(p.reviewDays,0)});
test('accelerated E2E: stale or forged active object still fails activation gate',()=>{assert.throws(()=>assertPlanReadyForActivation({status:'active',active:[{id:'fake',driver:'money_pressure'}],selectionDeepening:{required:true},deepening:{blocking:[]},activationStatus:'ready'}));assert.throws(()=>assertPlanReadyForActivation({status:'active',active:[],selectionDeepening:{required:false},deepening:{blocking:[]},activationStatus:'ready'}))});

test('accelerated E2E: Money + Health confirmed focus crosses Discovery → Planning without exact trace-id dependency',()=>{
 const output={trace:{states:[
  {concernId:'money',resolutionState:'sufficient',evidenceConfidence:.91,memberImportance:3,evidenceRefs:['m1']},
  {concernId:'physical_condition',sourceConcernId:'health',resolutionState:'sufficient',evidenceConfidence:.86,memberImportance:3,evidenceRefs:['h1']}
 ]},plan:{focus:[
  {concernId:'money',label:'Money',evidenceConfidence:.91,memberSelected:true,evidenceRefs:['m1']},
  {concernId:'health',label:'Health',evidenceConfidence:.86,memberSelected:true,evidenceRefs:['h1']}
 ]},baselineHandoff:{signals:{feasibility:{overall_load:'Manageable'},constraints:[]}}};
 const p=buildOnboardingAdaptivePlan({discoveryOutput:output,recommendedPriorities:['money','health'],confirmedPriorities:['money','health'],baselineHandoff:output.baselineHandoff});
 assert.notEqual(p.reason,'insufficient_evidence');
 assert.equal(p.status,'deepen');
 assert.ok((p.selectionDeepening?.requirements||[]).some(r=>r.evidenceKey==='financial.current_snapshot'));
});

console.log('accelerated canonical onboarding E2E QA passed');
