import test from 'node:test';
import assert from 'node:assert/strict';
import { safetyGate, assertSafetyAllowsOrdinaryFlow } from '../../intelligence/safety/gate.js';
import { buildPlan } from '../../intelligence/planning/planningEngine.js';

const stages=['discovery','prioritization','focus_confirmation','planning','activation','execution','review'];

for(const stage of stages){
 test(`S01 ${stage}: unresolved contextual Safety always interrupts ordinary flow`,()=>{
  const r=safetyGate({stage,contextualSignals:{functionalDeterioration:.8,severeSleepChange:.8},evidenceRefs:['EVD000001']});
  assert.equal(r.status,'confirmation_required');
  assert.equal(r.pauseOrdinaryFlow,true);
  assert.equal(r.contextual.needsDirectConfirmation,true);
  assert.throws(()=>assertSafetyAllowsOrdinaryFlow(r));
 });
}

test('S01 a single weak contextual signal does not fabricate acute risk',()=>{
 const r=safetyGate({stage:'discovery',contextualSignals:{functionalDeterioration:.64}});
 assert.equal(r.status,'clear_for_ordinary_flow');
 assert.equal(r.pauseOrdinaryFlow,false);
 assert.deepEqual(r.contextual.signals,[]);
});

test('S01 strong context requests direct confirmation but does not itself declare escalation',()=>{
 const r=safetyGate({stage:'review',contextualSignals:{functionalDeterioration:.91}});
 assert.equal(r.status,'confirmation_required');
 assert.equal(r.disposition,null);
 assert.equal(r.contextual.signals[0].level,'attention');
});

for(const confirmation of [
 {immediateDanger:true,intent:false,canStaySafe:true},
 {immediateDanger:false,intent:true,canStaySafe:true},
 {immediateDanger:false,intent:false,canStaySafe:false}
]){
 test(`S01 explicit positive confirmation deterministically escalates: ${JSON.stringify(confirmation)}`,()=>{
  const r=safetyGate({stage:'review',contextualSignals:{explicitSafetyConcern:true},confirmation});
  assert.equal(r.status,'escalate');
  assert.equal(r.pauseOrdinaryFlow,true);
  assert.equal(r.disposition.disposition,'escalate');
  assert.ok(r.disposition.constraints.includes('pause_ordinary_recommendations'));
  assert.ok(r.disposition.rationaleCodes.includes('direct_confirmation_positive'));
 });
}

test('S01 negative direct confirmation permits constrained continuation without converting unknown context to healthy',()=>{
 const r=safetyGate({stage:'discovery',contextualSignals:{functionalDeterioration:.8,severeSleepChange:.8},confirmation:{immediateDanger:false,intent:false,canStaySafe:true}});
 assert.equal(r.status,'continue_with_constraints');
 assert.equal(r.pauseOrdinaryFlow,false);
 assert.equal(r.unresolvedContext,true);
 assert.ok(r.disposition.constraints.includes('safety_confirmation_completed'));
});

test('S01 Safety escalation blocks Planning and exposes a governed recovery condition',()=>{
 const plan=buildPlan({memberStateRevision:8,focuses:[{constructId:'ACTIVITY_LEVEL',decision:'accepted'}],evidenceRefs:['EVD000001'],constraintRefs:[],safetyDisposition:'escalate'});
 assert.equal(plan.status,'blocked');
 assert.equal(plan.reason,'safety_override');
 assert.deepEqual(plan.proposedActions,[]);
 assert.ok(plan.decisionTrace.policyRefs.includes('safety_precedes_planning'));
 assert.ok(plan.decisionTrace.whatWouldChangeMind.includes('safety_disposition_cleared_by_governed_safety_flow'));
});
