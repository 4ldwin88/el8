// Member Focus confirmation/correction capability.
// Prioritization recommends; the member decides. This layer records acceptance,
// rejection, postponement, ordering and decision-relevant constraints without
// silently converting them into severity or Planning choices.

import { assertCanonicalConstructId } from '../contracts/canonical-vocabulary.js';
import { focusConfirmationToPlanning } from '../contracts/capability-boundaries.js';
import { applyMemberStateTransition, MEMBER_STATE_EVENT } from '../state/member-state-transition.js';

export const FOCUS_CONFIRMATION_VERSION='1.0.0';
export const CONSTRAINT_TYPES=Object.freeze(['time','energy','emotional_bandwidth','money','access','confidence','readiness','schedule','environment','other']);
export const FOCUS_DECISIONS=Object.freeze(['accepted','rejected','postponed','paused']);

function arr(v,n){if(!Array.isArray(v))throw new Error(`${n} must be an array`);return v}
function str(v,n){if(typeof v!=='string'||!v.trim())throw new Error(`${n} must be a non-empty string`);return v}
function unique(v){return [...new Set(v)]}
function recommendationIds(prioritization){return (prioritization?.recommended??[]).map(x=>x.constructId)}

export function normalizeFocusConstraints(constraints=[]){
  arr(constraints,'constraints');
  return constraints.map((value,index)=>{
    const item=typeof value==='string'?{type:value}:value;
    if(!item||typeof item!=='object')throw new Error(`constraints[${index}] must be an object or string`);
    if(!CONSTRAINT_TYPES.includes(item.type))throw new Error(`unsupported Focus constraint: ${item.type}`);
    if(item.constructId!=null)assertCanonicalConstructId(item.constructId,`constraints[${index}].constructId`);
    return Object.freeze({constraintId:item.constraintId??`focus-constraint:${index+1}`,type:item.type,constructId:item.constructId??null,note:item.note??null});
  });
}

export function confirmFocus({prioritization,decisions,constraints=[],decidedAt=new Date().toISOString()}={}){
  if(!prioritization||!Number.isInteger(prioritization.memberStateRevision))throw new Error('Prioritization result is required');
  arr(prioritization.recommended,'prioritization.recommended');arr(decisions,'decisions');str(decidedAt,'decidedAt');
  const recommended=recommendationIds(prioritization);const recommendedSet=new Set(recommended);
  const normalizedConstraints=normalizeFocusConstraints(constraints);
  const seen=new Set();
  const normalizedDecisions=decisions.map((decision,index)=>{
    if(!decision||typeof decision!=='object')throw new Error(`decisions[${index}] must be an object`);
    assertCanonicalConstructId(decision.constructId,`decisions[${index}].constructId`);
    if(!recommendedSet.has(decision.constructId))throw new Error(`Focus decision is not a Prioritization candidate: ${decision.constructId}`);
    if(seen.has(decision.constructId))throw new Error(`duplicate Focus decision: ${decision.constructId}`);seen.add(decision.constructId);
    if(!FOCUS_DECISIONS.includes(decision.decision))throw new Error(`unsupported Focus decision: ${decision.decision}`);
    const linkedConstraints=normalizedConstraints.filter(c=>c.constructId==null||c.constructId===decision.constructId).map(c=>c.constraintId);
    return Object.freeze({constructId:decision.constructId,decision:decision.decision,decidedAt:decision.decidedAt??decidedAt,reasonCodes:unique(decision.reasonCodes??[]),constraintRefs:unique([...(decision.constraintRefs??[]),...linkedConstraints]),memberRank:Number.isInteger(decision.memberRank)&&decision.memberRank>0?decision.memberRank:null});
  });
  const accepted=normalizedDecisions.filter(x=>x.decision==='accepted').sort((a,b)=>(a.memberRank??Number.MAX_SAFE_INTEGER)-(b.memberRank??Number.MAX_SAFE_INTEGER)||recommended.indexOf(a.constructId)-recommended.indexOf(b.constructId));
  const changed=recommended.length!==accepted.length||recommended.some((id,index)=>accepted[index]?.constructId!==id);
  return Object.freeze({schemaVersion:FOCUS_CONFIRMATION_VERSION,memberStateRevision:prioritization.memberStateRevision,recommended:[...recommended],decisions:normalizedDecisions,accepted,declined:normalizedDecisions.filter(x=>x.decision!=='accepted'),constraints:normalizedConstraints,memberChangedRecommendation:changed});
}

export function applyFocusConfirmation(memberState,confirmation,{source='member_focus_confirmation'}={}){
  if(memberState.revision!==confirmation.memberStateRevision)throw new Error(`Member State revision conflict: expected ${confirmation.memberStateRevision}, actual ${memberState.revision}`);
  let next=memberState;
  for(const decision of confirmation.decisions){
    next=applyMemberStateTransition(next,{type:MEMBER_STATE_EVENT.FOCUS_DECIDED,payload:decision,source,at:decision.decidedAt,expectedRevision:next.revision});
  }
  // Constraints are durable context evidence, not severity. Persist normalized constraint records.
  if(confirmation.constraints.length){
    const constraintMap={...next.constraints};
    for(const constraint of confirmation.constraints)constraintMap[constraint.constraintId]={...constraint,source:'member_focus_confirmation'};
    next={...next,constraints:constraintMap};
  }
  return next;
}

export function focusConfirmationPlanningInput(confirmation,{evidenceRefs=[],safetyDisposition='ordinary_flow'}={}){
  const constraintRefs=unique(confirmation.constraints.map(x=>x.constraintId));
  return focusConfirmationToPlanning({memberStateRevision:confirmation.memberStateRevision,focuses:confirmation.accepted,evidenceRefs,constraintRefs,safetyDisposition});
}
