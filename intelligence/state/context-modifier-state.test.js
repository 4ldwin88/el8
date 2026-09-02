import test from 'node:test';
import assert from 'node:assert/strict';
import {createMemberState} from './member-state-contract.js';
import {applyContextModifierToMemberState} from './context-modifier-state.js';

test('Discovery persists a context modifier without turning it into a concern',()=>{
 const state=createMemberState({memberId:'T0001',now:'2026-08-01T00:00:00Z'});const next=applyContextModifierToMemberState(state,{modifierId:'ctx-vaping-1',type:'VAPING',value:'current',sourceType:'member_report',sourceRef:'Q:CTX-VAPE',materialToPlanning:true},{source:'discovery',at:'2026-08-01T00:01:00Z',expectedRevision:0});
 assert.equal(next.memberContext.contextModifiers['ctx-vaping-1'].status,'ACTIVE');assert.equal(Object.keys(next.constructs).length,0);assert.equal(next.revision,1);
});

test('material context change flags an active Plan for revalidation without rewriting it',()=>{
 const state=createMemberState({memberId:'T0001',now:'2026-08-01T00:00:00Z'});state.activePlanRef={planId:'p1',version:1,focusIds:[],activatedAt:'2026-08-01T00:00:00Z',reconciliationRequired:false};state.activeActionIds=['ACT000006'];const next=applyContextModifierToMemberState(state,{modifierId:'ctx-injury-1',type:'INJURY',value:{area:'knee'},sourceType:'member_report',sourceRef:'Q:CTX-INJURY',expectedReviewAt:'2026-09-01T00:00:00Z',materialToPlanning:true},{source:'discovery',at:'2026-08-02T00:00:00Z',expectedRevision:0});
 assert.equal(next.activePlanRef.planId,'p1');assert.deepEqual(next.activeActionIds,['ACT000006']);assert.equal(next.activePlanRef.reconciliationRequired,true);assert.equal(next.activePlanRef.reconciliation.reason,'CONTEXT_MODIFIER_CHANGED');
});
