import {supabase}from'../../el8-client.js';

export function adaptationRpcPayload(transaction={}){
  if(transaction.status!=='confirmed')throw new Error('A confirmed adaptation transaction is required.');
  if(!['modify','reassess','reprioritize'].includes(transaction.adaptation))throw new Error('Unsupported adaptation transaction.');
  if(!transaction.planId||!transaction.interventionId)throw new Error('Plan and intervention are required.');
  return {confirmed:true,adaptation:transaction.adaptation,planId:transaction.planId,interventionId:transaction.interventionId,reason:transaction.reason||null,memberInstruction:transaction.memberInstruction||null,evidenceSessionIds:[...(transaction.reviewSessionIds||[])]};
}

export async function applyAdaptationTransaction(transaction){
  const p_transaction=adaptationRpcPayload(transaction);
  const{data,error}=await supabase.rpc('el8_apply_adaptive_plan_transaction',{p_transaction});
  if(error)throw error;
  return {resultingPlanId:data,mutationStatus:transaction.adaptation==='modify'?'superseded_and_versioned':'reassessment_required'};
}
