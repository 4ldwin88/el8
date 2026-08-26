import {supabase}from'../../el8-client.js';
import {adaptationRpcPayload} from './adaptation-payload.js';
export {adaptationRpcPayload} from './adaptation-payload.js';

export async function applyAdaptationTransaction(transaction){
  const p_transaction=adaptationRpcPayload(transaction);
  const{data,error}=await supabase.rpc('el8_apply_adaptive_plan_transaction',{p_transaction});
  if(error)throw error;
  return {resultingPlanId:data,mutationStatus:transaction.adaptation==='modify'?'superseded_and_versioned':'reassessment_required'};
}
