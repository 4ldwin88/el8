import { supabase } from '../../el8-client.js';

export async function loadActionReviewHistory({userId,planId,interventionId}={}){
  if(!userId||!planId||!interventionId) return null;
  const {data,error}=await supabase
    .from('el8_assessment_sessions')
    .select('id,submitted_at,derived_outputs,trigger_context')
    .eq('user_id',userId)
    .eq('module_id','ADAPTIVE-PLAN-REVIEW')
    .eq('module_type','plan_review')
    .eq('status','completed')
    .order('submitted_at',{ascending:false})
    .limit(25);
  if(error) throw error;
  const row=(data||[]).find(x=>x?.trigger_context?.plan_id===planId&&x?.trigger_context?.intervention_id===interventionId);
  if(!row) return null;
  const outputs=row.derived_outputs||{};
  return {id:row.id,submittedAt:row.submitted_at,outcome:outputs.outcome||null,policy:outputs.decision||null};
}
