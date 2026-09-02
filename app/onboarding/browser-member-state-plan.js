// Browser activation edge for canonical Member State.
// The Plan remains its own artifact; Member State stores only its reference, Focus IDs and Action IDs.
import {MEMBER_STATE_SCHEMA_VERSION} from '../../intelligence/state/member-state-contract.js';
import {applyMemberStateTransition,MEMBER_STATE_EVENT} from '../../intelligence/state/member-state-transition.js';
export function applyCanonicalBrowserPlan(state,plan,{at=new Date().toISOString(),planId=null}={}){
 if(!state||state.schemaVersion!==MEMBER_STATE_SCHEMA_VERSION||!Number.isInteger(state.revision))throw new Error('canonical Member State is required');
 if(!plan||plan.status!=='proposed'||plan.memberStateRevision!==state.revision)throw new Error('canonical Plan revision conflict');
 const actions=plan.proposedActions||plan.actions||[];if(!actions.length)throw new Error('canonical Plan requires at least one proposed Action');
 const focusIds=[...(plan.focusIds||[])];if(!focusIds.length)throw new Error('canonical Plan requires accepted Focus');
 const actionIds=actions.map(a=>a.actionId).filter(Boolean);if(actionIds.length!==actions.length)throw new Error('canonical Plan Action requires actionId');
 const resolvedPlanId=planId||plan.planId||`plan:${state.memberId}:${state.revision+1}`;
 return applyMemberStateTransition(state,{type:MEMBER_STATE_EVENT.PLAN_ACTIVATED,payload:{planId:resolvedPlanId,version:plan.schemaVersion||plan.version||null,focusIds,actionIds,activatedAt:at},source:'planning:canonical',at,expectedRevision:state.revision});
}
