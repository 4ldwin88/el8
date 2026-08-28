import assert from 'node:assert/strict';
import test from 'node:test';
import memberStateModule from '../member-state/member-state.js';
import memberStateUpdateModule from '../member-state/member-state-update.js';
import planningAdapterModule from '../member-state/planning-adapter.js';
import {buildCanonicalPlan} from './canonical-plan-engine.js';
import {assertPlanReadyForActivation} from './activation-readiness.js';

const {createMemberState}=memberStateModule;
const {applyMemberStateUpdate}=memberStateUpdateModule;
const {projectPlanningInput}=planningAdapterModule;
const at='2026-08-27T22:00:00.000Z';
function w(s,type,payload){return applyMemberStateUpdate(s,{type,payload,source:'qa.accelerated-canonical',at,expectedRevision:s.revision})}
const cases=[['movement','problem:low_activity','baseline.activity_level','Almost none','P01'],['sleep','problem:poor_sleep','baseline.sleep_pattern','Timing changes a lot','P02'],['money','problem:financial_strain','financial.current_snapshot','Understand where my money is going','P03'],['work','problem:income_gap','work.current_income_route','Apply for jobs','P05'],['support','problem:social_disconnection','support.available','Yes','P07'],['home','problem:environment_friction','environment.current_barrier','Clutter or organization','P08']];
function state(name,problemId,capacity='medium'){let s=createMemberState({memberId:`QA-${name}`,now:at});s=w(s,'PROBLEM_UPDATED',{id:problemId,status:'SUPPORTED',evidenceRefs:[`d:${name}`]});s=w(s,'PRIORITY_UPDATED',{id:`priority:${name}`,problemId,status:'ACCEPTED',memberDecisionAt:at});s=w(s,'ENGAGEMENT_BURDEN_UPDATED',{capacity,manageability:capacity==='low'?'difficult':'manageable'});return s}
for(const[name,problemId,key,answer,registryProblem]of cases)test(`canonical accelerated E2E: ${name}`,()=>{const input=projectPlanningInput(state(name,problemId));const blocked=buildCanonicalPlan(input);assert.equal(blocked.status,'deepen');assert.equal(blocked.reason,'selection_evidence_required');assert.ok(blocked.selectionDeepening.requirements.some(r=>r.evidenceKey===key));const plan=buildCanonicalPlan(input,{selectionEvidence:{[key]:answer}});assert.equal(plan.status,'active');assert.ok(plan.active.length>=1);assert.ok(plan.active.every(a=>a.problem_id===registryProblem));assert.ok(plan.active[0].rationale);assert.ok(plan.active[0].purpose);assert.ok(plan.active[0].measurement);assert.ok(plan.active[0].reviewRule)});
test('canonical accelerated E2E: rejected intervention is not silently restored',()=>{const input=projectPlanningInput(state('movement','problem:low_activity'));const evidence={'baseline.activity_level':'Almost none'};const first=buildCanonicalPlan(input,{selectionEvidence:evidence});const rejected=first.active[0].intervention_id;const next=buildCanonicalPlan(input,{selectionEvidence:evidence,rejectedInterventionIds:[rejected]});assert.ok(!next.active.some(a=>a.intervention_id===rejected));assert.ok(next.status==='active'||next.reason==='no_eligible_registry_intervention')});
test('canonical accelerated E2E: low capacity permits one commitment',()=>{const input=projectPlanningInput(state('work','problem:income_gap','low'));const plan=buildCanonicalPlan(input,{selectionEvidence:{'work.current_income_route':'Apply for jobs'}});assert.equal(plan.status,'active');assert.equal(plan.active.length,1)});
test('canonical accelerated E2E: activation cannot bypass missing evidence',()=>{const input=projectPlanningInput(state('money','problem:financial_strain'));assert.throws(()=>assertPlanReadyForActivation(buildCanonicalPlan(input)));assert.throws(()=>assertPlanReadyForActivation({status:'active',active:[{id:'fake'}],selectionDeepening:{required:true},deepening:{blocking:[]},activationStatus:'ready'}))});
