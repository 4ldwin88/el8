import {
  createConstructState,
  createFocusDecision,
  validateMemberStateShape,
} from './member-state-contract.js';
import { isConstructId, isDimensionId } from '../../registries/taxonomy/index.js';

export const MEMBER_STATE_EVENT = Object.freeze({
  DIMENSION_UPDATED: 'DIMENSION_UPDATED',
  CONSTRUCT_UPDATED: 'CONSTRUCT_UPDATED',
  FACT_RECORDED: 'FACT_RECORDED',
  HYPOTHESIS_UPDATED: 'HYPOTHESIS_UPDATED',
  FOCUS_DECIDED: 'FOCUS_DECIDED',
  PLAN_ACTIVATED: 'PLAN_ACTIVATED',
  PLAN_CLEARED: 'PLAN_CLEARED',
  MEMBER_CONTEXT_UPDATED: 'MEMBER_CONTEXT_UPDATED',
  SAFETY_DISPOSITION_UPDATED: 'SAFETY_DISPOSITION_UPDATED',
  REVIEW_CYCLE_LINKED: 'REVIEW_CYCLE_LINKED',
});

function clone(v){return structuredClone(v)}
function requireString(v,n){if(typeof v!=='string'||!v.trim())throw new Error(`${n} required`)}
function requireArray(v,n){if(!Array.isArray(v))throw new Error(`${n} must be array`)}
function unique(v){return [...new Set(v)]}
function validateState(state){const errors=validateMemberStateShape(state);if(errors.length)throw new Error(`invalid canonical Member State: ${errors.join('; ')}`)}

export function applyMemberStateTransition(state,{type,payload={},source,at=new Date().toISOString(),expectedRevision}={}){
  validateState(state);
  if(expectedRevision!==state.revision)throw new Error(`Member State revision conflict: expected ${expectedRevision}, actual ${state.revision}`);
  requireString(source,'transition source'); requireString(at,'transition time');
  const next=clone(state);

  switch(type){
    case MEMBER_STATE_EVENT.DIMENSION_UPDATED:{
      const {dimensionId,...patch}=payload;
      if(!isDimensionId(dimensionId))throw new Error(`Unknown dimensionId: ${dimensionId}`);
      next.dimensions[dimensionId]={...next.dimensions[dimensionId],...clone(patch),dimensionId,lastDerivedAt:at};
      break;
    }
    case MEMBER_STATE_EVENT.CONSTRUCT_UPDATED:{
      const {constructId,...patch}=payload;
      if(!isConstructId(constructId))throw new Error(`Unknown constructId: ${constructId}`);
      const current=next.constructs[constructId]??createConstructState({constructId,now:at});
      next.constructs[constructId]={...current,...clone(patch),constructId,lastDerivedAt:at};
      for(const dimensionId of next.constructs[constructId].dimensionIds??[]){
        const d=next.dimensions[dimensionId]; if(d)d.constructIds=unique([...(d.constructIds??[]),constructId]);
      }
      break;
    }
    case MEMBER_STATE_EVENT.FACT_RECORDED:{
      requireString(payload.factId,'factId'); requireString(payload.semanticKey,'semanticKey');
      requireString(payload.sourceType,'fact sourceType'); requireString(payload.sourceRef,'fact sourceRef');
      requireString(payload.observedAt,'fact observedAt');
      if(payload.affectedConstructId!=null&&!isConstructId(payload.affectedConstructId))throw new Error(`Unknown constructId: ${payload.affectedConstructId}`);
      if(payload.affectedDimensionId!=null&&!isDimensionId(payload.affectedDimensionId))throw new Error(`Unknown dimensionId: ${payload.affectedDimensionId}`);
      const existing=next.facts[payload.factId];
      if(existing&&JSON.stringify(existing)!==JSON.stringify(payload))throw new Error(`factId is immutable once recorded: ${payload.factId}`);
      next.facts[payload.factId]=clone(payload);
      break;
    }
    case MEMBER_STATE_EVENT.HYPOTHESIS_UPDATED:{
      requireString(payload.hypothesisId,'hypothesisId'); requireString(payload.proposition,'hypothesis proposition');
      requireArray(payload.evidenceFor??[],'hypothesis evidenceFor'); requireArray(payload.evidenceAgainst??[],'hypothesis evidenceAgainst');
      if(['generated','corroborating'].includes(payload.status)){
        requireString(payload.revalidationPolicy,'hypothesis revalidationPolicy');
        requireString(payload.revalidateAfter,'hypothesis revalidateAfter');
      }
      const current=next.hypotheses[payload.hypothesisId]??{};
      next.hypotheses[payload.hypothesisId]={confirmationStatus:'not_required',linkedConstructIds:[],linkedDimensionIds:[],evidenceFor:[],evidenceAgainst:[],createdAt:at,...current,...clone(payload),hypothesisId:payload.hypothesisId,lastDerivedAt:at};
      break;
    }
    case MEMBER_STATE_EVENT.FOCUS_DECIDED:{
      const {constructId,decision}=payload;
      if(!isConstructId(constructId))throw new Error(`Unknown constructId: ${constructId}`);
      if(!next.constructs[constructId])throw new Error(`Focus decision requires known construct: ${constructId}`);
      const prior=next.focusDecisions[constructId];
      next.focusDecisions[constructId]=createFocusDecision({constructId,decision,decidedAt:payload.decidedAt??at,reasonCodes:payload.reasonCodes??[],constraintRefs:payload.constraintRefs??[]});
      if(decision==='accepted') next.activeFocusIds=unique([...next.activeFocusIds,constructId]);
      else next.activeFocusIds=next.activeFocusIds.filter(id=>id!==constructId);
      if(prior?.decision==='accepted'&&['rejected','postponed','paused'].includes(decision)&&next.activePlanRef){
        next.activePlanRef={...next.activePlanRef,reconciliationRequired:true,reconciliation:{reason:'MEMBER_FOCUS_WITHDRAWN',constructId,withdrawnDecision:decision,at}};
      }
      break;
    }
    case MEMBER_STATE_EVENT.PLAN_ACTIVATED:{
      requireString(payload.planId,'planId'); requireArray(payload.actionIds,'actionIds'); requireArray(payload.focusIds,'focusIds');
      if(!payload.actionIds.length)throw new Error('active Plan requires at least one Action');
      for(const constructId of payload.focusIds){
        if(!next.activeFocusIds.includes(constructId)||next.focusDecisions[constructId]?.decision!=='accepted')throw new Error(`Plan Focus must be member accepted: ${constructId}`);
      }
      next.activePlanRef={planId:payload.planId,version:payload.version??null,focusIds:[...payload.focusIds],activatedAt:payload.activatedAt??at,reconciliationRequired:false};
      next.activeActionIds=unique(payload.actionIds);
      break;
    }
    case MEMBER_STATE_EVENT.PLAN_CLEARED:{next.activePlanRef=null; next.activeActionIds=[]; break;}
    case MEMBER_STATE_EVENT.MEMBER_CONTEXT_UPDATED:{
      const patch=clone(payload); for(const key of ['capacity','manageability','readiness'])if(patch[key]==null)patch[key]='unknown';
      next.memberContext={...next.memberContext,...patch}; break;
    }
    case MEMBER_STATE_EVENT.SAFETY_DISPOSITION_UPDATED:{next.safety={...next.safety,...clone(payload),updatedAt:at}; break;}
    case MEMBER_STATE_EVENT.REVIEW_CYCLE_LINKED:{
      requireString(payload.reviewCycleId,'reviewCycleId');
      if(!next.reviewCycles.some(x=>(typeof x==='string'?x:x.reviewCycleId)===payload.reviewCycleId))next.reviewCycles.push(clone(payload));
      break;
    }
    default: throw new Error(`unsupported canonical Member State transition: ${type}`);
  }

  next.revision=state.revision+1; next.updatedAt=at;
  next.historyRefs=unique([...next.historyRefs,`${next.revision}:${type}:${source}`]);
  validateState(next);
  return next;
}
