import assert from 'node:assert/strict';
import { CANONICAL_ACTION_BANK, CANONICAL_ACTION_BY_ID } from './action-bank.js';
import { createActionRegistry } from './action-registry.js';

assert.equal(CANONICAL_ACTION_BANK.length,41);
assert.equal(new Set(CANONICAL_ACTION_BANK.map(x=>x.actionId)).size,41);
for(const action of CANONICAL_ACTION_BANK){
 assert.match(action.actionId,/^(PHY|EMT|SOC|OCC|FIN|ENV|INT|SPT|XDM)-A\d{2}$/);
 assert.ok(action.trackingRequirement,`${action.actionId} tracking required`);assert.ok(action.iconKey,`${action.actionId} icon required`);assert.ok(action.permittedRationaleClaim,`${action.actionId} claim ceiling required`);assert.ok(action.evidenceReviewStatus,`${action.actionId} evidence review status required`);assert.ok(action.review.trigger,`${action.actionId} review trigger required`);assert.ok(action.measurement.decisionUse,`${action.actionId} decision-use measurement required`);assert.notEqual(String(action.review.trigger).trim().toLowerCase(),'7 days',`${action.actionId} review timing must be decision-driven, not universally hard-coded to seven days`);assert.ok(!/generic.*check.?in/i.test(`${action.instruction||''} ${action.trackingRequirement||''}`),`${action.actionId} must not use generic check-ins instead of decision-useful measurement`);if(action.actionScope==='construct')assert.ok(action.constructIds.length>0,`${action.actionId} construct mapping required`);if(action.actionScope==='plan')assert.equal(action.constructIds.length,0,`${action.actionId} plan Action must not fake construct relevance`);
}
assert.equal(CANONICAL_ACTION_BY_ID['SOC-A04'].status,'held');assert.equal(CANONICAL_ACTION_BY_ID['INT-A04'].status,'held');assert.equal(CANONICAL_ACTION_BY_ID['XDM-A01'].name,'Reduce simultaneous plan demands');assert.equal(CANONICAL_ACTION_BY_ID['PHY-A03'].actionScope,'plan');
const registry=createActionRegistry(CANONICAL_ACTION_BANK);let r=registry.eligibleFor({focusIds:['ACTIVITY_LEVEL']});assert.ok(r.eligible.some(x=>x.actionId==='PHY-A02'));assert.ok(r.rejected.find(x=>x.actionId==='XDM-A01').reasonCodes.includes('requires_explicit_planning_condition'));r=registry.eligibleFor({focusIds:['ACTIVITY_LEVEL'],approvedPlanActionIds:['XDM-A01']});assert.ok(r.eligible.some(x=>x.actionId==='XDM-A01'));assert.equal(registry.forConstruct('RELATIONSHIP_STRAIN').length,0);assert.equal(registry.forConstruct('RELATIONSHIP_STRAIN',{includeHeld:true})[0].actionId,'SOC-A04');
console.log('All 41 Drive Actions use the canonical dimension-Axx namespace with governance contracts');
