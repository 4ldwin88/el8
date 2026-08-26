import {supabase} from '../../el8-client.js';

export async function startPlanReassessment({planId,kind,reason=null,evidenceSessionIds=[],requestedDimension=null}={}){
  if(!planId)throw new Error('planId is required');
  if(!['reassess','reprioritize'].includes(kind))throw new Error('kind must be reassess or reprioritize');
  const {data,error}=await supabase.rpc('el8_start_plan_reassessment',{p_plan_id:planId,p_kind:kind,p_reason:reason,p_evidence_session_ids:evidenceSessionIds,p_requested_dimension:requestedDimension});
  if(error)throw error;
  return data;
}

export async function completePlanReassessment({reassessmentId,responses={},decision}={}){
  if(!reassessmentId)throw new Error('reassessmentId is required');
  if(decision?.confirmed!==true)throw new Error('A member-confirmed reassessment decision is required');
  if(!decision.primaryAction?.trim())throw new Error('A confirmed primary action is required');
  const {data,error}=await supabase.rpc('el8_complete_plan_reassessment',{p_reassessment_id:reassessmentId,p_responses:responses,p_decision:decision});
  if(error)throw error;
  return data;
}
