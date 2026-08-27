import test from 'node:test';
import assert from 'node:assert/strict';
import {buildOnboardingAdaptivePlan} from './adaptive-plan.js';
import {assertPlanReadyForActivation} from './activation-readiness.js';

const profile=({concernId,label,confidence=.9,importance='high',capacity='low'})=>({trace:{states:[{concernId,label,resolutionState:'sufficient',evidenceConfidence:confidence,memberImportance:importance,memberPrioritySelected:true,immediacyClass:'routine',readiness:3,feasibility:{constraints:[],supports:[],values:{capacity},evidenceRefs:[`d:${concernId}`]},evidenceRefs:[`d:${concernId}`]}]},plan:{focus:[{concernId,label,evidenceConfidence:confidence,memberSelected:true}]},baselineHandoff:{signals:{feasibility:{overall_load:capacity==='low'?'Difficult':'Manageable'},constraints:[]}}});
const cases=[
 {name:'money visibility',concernId:'money_pressure',label:'Money',key:'financial.current_snapshot',answer:'Understand where my money is going',problem:'P03'},
 {name:'sleep difficulty',concernId:'poor_sleep',label:'Sleep',key:'baseline.sleep_pattern',answer:'Timing changes a lot',problem:'P02'},
 {name:'low activity',concernId:'low_activity',label:'Movement',key:'baseline.activity_level',answer:'Almost none',problem:'P01'},
 {name:'work instability',concernId:'work_instability',label:'Work',key:'work.current_income_route',answer:'Apply for jobs',problem:'P05'},
 {name:'weak support',concernId:'low_support',label:'Support',key:'support.available',answer:'Yes',problem:'P07'},
 {name:'environment friction',concernId:'home_instability',label:'Home',key:'environment.current_barrier',answer:'Clutter or organization',problem:'P08'}
];
function build(c,selectionEvidence={},extra={}){const discoveryOutput=profile(c);return buildOnboardingAdaptivePlan({discoveryOutput,recommendedPriorities:[c.concernId],confirmedPriorities:[c.concernId],baselineHandoff:discoveryOutput.baselineHandoff,selectionEvidence,...extra});}

for(const c of cases)test(`accelerated member E2E: ${c.name} requires decision evidence then produces a purposeful plan`,()=>{
 const blocked=build(c);assert.equal(blocked.status,'deepen');assert.equal(blocked.reason,'selection_evidence_required');assert.ok(blocked.selectionDeepening.requirements.some(r=>r.evidenceKey===c.key));
 const plan=build(c,{[c.key]:c.answer});assert.equal(plan.status,'active');assert.ok(plan.active.length>=1);assert.ok(plan.active.every(a=>a.problem_id===c.problem));
 const action=plan.active[0];assert.ok(action.title);assert.ok(action.rationale);assert.ok(action.purpose);assert.ok(action.measurement?.adherence);assert.ok(action.measurement?.outcome);assert.ok(action.review_rule?.window);assert.ok(action.action_templates?.length);
 assert.notEqual(action.rationale.trim(),'',`${c.name} must explain why the action was selected`);
});

test('accelerated member E2E: member rejection cannot silently restore the rejected intervention',()=>{const c=cases[2];const first=build(c,{[c.key]:c.answer},{capacity:'medium'});assert.equal(first.status,'active');const rejected=first.active[0].intervention_id;const next=build(c,{[c.key]:c.answer},{capacity:'medium',rejectedInterventionIds:[rejected]});assert.ok(!next.active?.some(a=>a.intervention_id===rejected));assert.ok(next.status==='active'||next.reason==='no_eligible_registry_intervention')});

test('accelerated member E2E: low capacity presents one active commitment rather than an overloaded plan',()=>{const c=cases[3];const plan=build(c,{[c.key]:c.answer},{capacity:'low'});assert.equal(plan.status,'active');assert.equal(plan.active.length,1)});

test('accelerated member E2E: activation cannot be forged or bypass missing evidence',()=>{const c=cases[0];assert.throws(()=>assertPlanReadyForActivation(build(c)));assert.throws(()=>assertPlanReadyForActivation({status:'active',active:[{id:'fake'}],selectionDeepening:{required:true},deepening:{blocking:[]},activationStatus:'ready'}));});

test('accelerated member E2E: activation evidence may be supplied immediately without falsifying review cadence',()=>{const c=cases[0];let p=build(c,{[c.key]:c.answer});const evidence={};for(const r of p.deepening?.blocking||[]){const key=r.evidenceKey||r.requirementId||r.id;if(key)evidence[key]=r.options?.[0]||'QA evidence supplied';}p=build(c,{[c.key]:c.answer},{evidence});if((p.deepening?.blocking||[]).length===0&&p.activationStatus!=='needs_plan_specific_assessment')assert.ok(assertPlanReadyForActivation(p).length>=1);assert.notEqual(p.reviewDays,0)});
