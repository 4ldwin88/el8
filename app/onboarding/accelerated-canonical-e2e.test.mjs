import test from 'node:test';
import assert from 'node:assert/strict';
import {buildDiscoverySnapshotHandoff} from './discovery-snapshot-handoff.js';
import {createDiscoveryFromSnapshot,discoveryPrioritizationInput,buildOnboardingPlan} from './canonical-planning-pipeline.js';
import {projectOnboardingMemberState} from './member-state-projection.js';
import {appendObservation,setResolution} from '../../intelligence/discovery/discovery-controller.js';
import {applyCanonicalBrowserPlan} from './browser-member-state-plan.js';
import {activateCanonicalOnboarding} from './plan-activation-transaction.js';
import {assertPlanReadyForActivation} from '../../intelligence/planning/activation-readiness.js';
import {CANONICAL_ACTION_BANK} from '../../intelligence/planning/canonical-action-bank.js';

function establish(session,concernId,{importance='high'}={}){
 appendObservation(session,{concernId,questionId:`raw:${concernId}`,effects:[{type:'evidence',target:concernId,polarity:'supports',strength:.9},{type:'importance',target:concernId,value:importance}]});
 setResolution(session,concernId,'sufficient',{driverKnown:true});
 return session;
}
function rawHandoff(raw,candidateConcerns){return buildDiscoverySnapshotHandoff({...raw,candidate_concerns:candidateConcerns})}

test('runtime Action Bank exposes only Drive-canonical Action IDs',()=>{
 const ids=CANONICAL_ACTION_BANK.map(action=>action.actionId);
 assert.ok(ids.includes('PHY-A02'));
 assert.ok(ids.includes('EMT-A01'));
 assert.ok(ids.includes('SPT-A01'));
 assert.ok(ids.every(id=>/^(?:PHY|EMT|SOC|OCC|FIN|ENV|INT|SPT|XDM)-A\d{2}$/.test(id)));
 assert.ok(ids.every(id=>!/(?:EMO|SPI)-|-[0-9]{3}$/.test(id)));
});

test('signal-native onboarding evidence reaches durable canonical activation',async()=>{
 const raw={member_priority_concerns:['low_activity'],feasibility:{time:'<5 min',overall_load:'Difficult'}};
 const discovery=establish(createDiscoveryFromSnapshot(rawHandoff(raw,['low_activity'])),'low_activity');
 const focusDecisions=[{constructId:'ACTIVITY_LEVEL',decision:'accepted'}];
 const canonicalDiscovery=discoveryPrioritizationInput(discovery,{memberStateRevision:0});
 assert.deepEqual(canonicalDiscovery.candidates.map(x=>x.constructId),['ACTIVITY_LEVEL']);
 const projected=projectOnboardingMemberState({memberId:'member:e2e',constructs:canonicalDiscovery.candidates.map(c=>({...c,sufficiency:'sufficient'})),focusDecisions,memberContext:{capacity:'low'}});
 const built=buildOnboardingPlan({session:discovery,memberStateRevision:projected.revision,focusDecisions});
 assert.equal(built.prioritization.recommended[0].constructId,'ACTIVITY_LEVEL');
 assert.equal(built.confirmation.accepted[0].constructId,'ACTIVITY_LEVEL');
 assert.equal(built.plan.memberStateRevision,projected.revision);
 assert.equal(built.plan.status,'proposed');
 assert.ok(built.plan.proposedActions.some(a=>a.actionId==='PHY-A02'));
 const store={state:structuredClone(projected),plan:null};
 const result=await activateCanonicalOnboarding({
  userId:'member:e2e',memberState:projected,plan:built.plan,applyPlan:applyCanonicalBrowserPlan,
  loadState:async()=>store.state?{revision:store.state.revision,state:store.state}:null,
  persistState:async({expectedRevision,state})=>{assert.equal(expectedRevision,store.state?store.state.revision:-1);store.state=state;return{revision:state.revision,state}},
  persistPlan:async({plan})=>{store.plan={...plan,id:'plan:e2e'};return{id:'plan:e2e',status:'proposed'}},
  activatePlan:async({planId})=>{assert.equal(planId,'plan:e2e');store.plan.status='active';return{id:planId,status:'active'}},
  completeOnboarding:async()=>{}
 });
 assert.equal(store.plan.status,'active');
 assert.equal(result.activePlanRef.planId,'plan:e2e');
 assert.deepEqual(result.activeFocusIds,['ACTIVITY_LEVEL']);
 assert.ok(result.activeActionIds.includes('PHY-A02'));
 assert.equal('problems' in result,false);
 assert.equal('priorities' in result,false);
});

test('emotional Planning emits Drive-canonical EMT Action IDs',()=>{
 const raw={member_priority_concerns:['stress'],feasibility:{time:'10 min',overall_load:'Manageable'}};
 const discovery=establish(createDiscoveryFromSnapshot(rawHandoff(raw,['stress'])),'stress');
 const built=buildOnboardingPlan({session:discovery,memberStateRevision:1,focusDecisions:[{constructId:'PRESSURE_PATTERN',decision:'accepted'}],planningOptions:{preferredActionIds:['EMT-A01']}});
 assert.equal(built.plan.status,'proposed');
 assert.ok(built.plan.proposedActions.some(action=>action.actionId==='EMT-A01'));
 assert.ok(built.plan.proposedActions.every(action=>!action.actionId.startsWith('EMO-')));
});

test('spiritual/direction Planning accepts Drive-canonical SPT Action IDs',()=>{
 const raw={member_priority_concerns:['low_direction'],feasibility:{time:'10 min',overall_load:'Manageable'}};
 const discovery=establish(createDiscoveryFromSnapshot(rawHandoff(raw,['low_direction'])),'low_direction');
 const built=buildOnboardingPlan({session:discovery,memberStateRevision:1,focusDecisions:[{constructId:'DIRECTION_CLARITY',decision:'accepted'}],planningOptions:{preferredActionIds:['SPT-A03']}});
 assert.equal(built.plan.status,'proposed');
 assert.ok(built.plan.proposedActions.some(action=>action.actionId==='SPT-A03'));
 assert.ok(built.plan.proposedActions.every(action=>!action.actionId.startsWith('SPI-')));
});

test('ambiguous financial evidence is held for discrimination and cannot invent Focus',()=>{
 const raw={member_priority_concerns:['money'],feasibility:{time:'<5 min',overall_load:'Difficult'}};
 const discovery=establish(createDiscoveryFromSnapshot(rawHandoff(raw,['money'])),'money');
 const handoff=discoveryPrioritizationInput(discovery,{memberStateRevision:2});
 assert.equal(handoff.candidates.length,0);
 assert.deepEqual(new Set(handoff.heldAmbiguous.map(x=>x.constructId)),new Set(['FINANCIAL_STRAIN','FINANCIAL_CONTROL']));
 assert.throws(()=>buildOnboardingPlan({session:discovery,memberStateRevision:2,focusDecisions:[{constructId:'FINANCIAL_STRAIN',decision:'accepted'}]}),/recommended candidate|Focus/i);
});

test('positive or no-focus onboarding does not force Discovery, Focus, Plan or Action',()=>{
 const handoff=buildDiscoverySnapshotHandoff({indicator_signals:{activity:{value:5,concerns:['low_activity'],dimension:'Physical'}},feasibility:{time:'10 min',overall_load:'Easy'}});
 assert.equal(createDiscoveryFromSnapshot(handoff),null);
});

test('low-information concern remains upstream and cannot produce a Plan',()=>{
 const raw={feasibility:{time:'<5 min',overall_load:'Difficult'}};
 const discovery=createDiscoveryFromSnapshot(rawHandoff(raw,['low_activity']));
 const handoff=discoveryPrioritizationInput(discovery,{memberStateRevision:1});
 assert.equal(handoff.candidates.length,0);
 assert.throws(()=>buildOnboardingPlan({session:discovery,memberStateRevision:1,focusDecisions:[{constructId:'ACTIVITY_LEVEL',decision:'accepted'}]}),/recommended candidate|Focus/i);
});

test('multi-focus Planning is adaptive and low capacity constrains burden without rewriting severity',()=>{
 const raw={member_priority_concerns:['poor_sleep','low_activity'],feasibility:{time:'<5 min',overall_load:'Difficult'}};
 const discovery=createDiscoveryFromSnapshot(rawHandoff(raw,['poor_sleep','low_activity']));
 establish(discovery,'poor_sleep');establish(discovery,'low_activity');
 const decisions=[{constructId:'SLEEP_QUALITY',decision:'accepted'},{constructId:'ACTIVITY_LEVEL',decision:'accepted'}];
 const handoff=discoveryPrioritizationInput(discovery,{memberStateRevision:0});
 const projected=projectOnboardingMemberState({memberId:'member:multi',constructs:handoff.candidates.map(c=>({...c,sufficiency:'sufficient'})),focusDecisions:decisions,memberContext:{capacity:'low'}});
 const built=buildOnboardingPlan({session:discovery,memberStateRevision:projected.revision,focusDecisions:decisions,planningOptions:{burdenBudget:1}});
 assert.equal(built.confirmation.accepted.length,2);
 assert.equal(built.plan.focusIds.length,2);
 assert.ok(built.plan.proposedActions.length<=1);
 assert.ok(built.plan.uncoveredFocusIds.length>=1);
 assert.equal(projected.memberContext.capacity,'low');
 assert.equal(projected.constructs.SLEEP_QUALITY.status,'supported');
 assert.equal(projected.constructs.ACTIVITY_LEVEL.status,'supported');
});

test('Action-specific assessment requirement blocks activation until resolved',()=>{
 const raw={member_priority_concerns:['poor_sleep'],feasibility:{time:'10 min',overall_load:'Manageable'}};
 const discovery=establish(createDiscoveryFromSnapshot(rawHandoff(raw,['poor_sleep'])),'poor_sleep');
 const built=buildOnboardingPlan({session:discovery,memberStateRevision:1,focusDecisions:[{constructId:'SLEEP_QUALITY',decision:'accepted'}]});
 const plan={...built.plan,activationStatus:'needs_plan_specific_assessment',deepening:{blocking:[{actionId:built.plan.proposedActions[0].actionId}],requirements:[{actionId:built.plan.proposedActions[0].actionId}]}};
 assert.throws(()=>assertPlanReadyForActivation(plan),/Action-specific assessment/);
 const resolved={...built.plan,activationStatus:'ready',deepening:{blocking:[],requirements:[]}};
 assert.ok(assertPlanReadyForActivation(resolved).length>=1);
});

test('safety interruption blocks ordinary Planning without manufacturing wellness severity',()=>{
 const raw={member_priority_concerns:['low_activity'],feasibility:{time:'10 min',overall_load:'Manageable'}};
 const discovery=establish(createDiscoveryFromSnapshot(rawHandoff(raw,['low_activity'])),'low_activity');
 const built=buildOnboardingPlan({session:discovery,memberStateRevision:1,focusDecisions:[{constructId:'ACTIVITY_LEVEL',decision:'accepted'}],safetyDisposition:'pause_ordinary_flow'});
 assert.equal(built.plan.status,'blocked');
 assert.equal(built.plan.reason,'safety_override');
 assert.deepEqual(built.plan.proposedActions,[]);
 assert.equal(built.prioritization.recommended[0].constructId,'ACTIVITY_LEVEL');
 assert.throws(()=>assertPlanReadyForActivation(built.plan),/Safety clarification/);
});
