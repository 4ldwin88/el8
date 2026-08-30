import test from 'node:test';
import assert from 'node:assert/strict';
import {buildDiscoverySnapshotHandoff} from './discovery-snapshot-handoff.js';
import {createDiscoveryFromSnapshot,discoveryPrioritizationInput,buildOnboardingPlan} from './canonical-planning-pipeline.js';
import {projectOnboardingMemberState} from './member-state-projection.js';
import {appendObservation,setResolution} from '../../intelligence/discovery/discovery-controller.js';
import {applyCanonicalBrowserPlan} from './browser-member-state-plan.js';
import {activateCanonicalOnboarding} from './plan-activation-transaction.js';

test('raw onboarding evidence reaches durable canonical activation without legacy authority',async()=>{
 const raw={condition_baseline:{Physical:'Struggling'},member_priority:'Physical',functional_impact:['Physical'],worsening:['Physical'],feasibility:{time:'<5 min',overall_load:'Difficult'}};
 const handoff={...buildDiscoverySnapshotHandoff(raw),candidateConcerns:['low_activity'],uncertainty:{requiresDiscoveryConfirmation:true},signals:{feasibility:raw.feasibility}};
 const discovery=createDiscoveryFromSnapshot(handoff);
 appendObservation(discovery,{concernId:'low_activity',questionId:'raw:activity',effects:[{type:'evidence',target:'low_activity',polarity:'supports',strength:.9},{type:'importance',target:'low_activity',value:'high'}]});
 setResolution(discovery,'low_activity','sufficient',{driverKnown:true});
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
 const store={state:null,plan:null};
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
