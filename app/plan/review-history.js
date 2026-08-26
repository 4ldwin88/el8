import { supabase } from '../../el8-client.js';
import { decidePlanAdaptation } from '../../intelligence/planning/adaptation-policy.js';

export function normalizeReviewRow(row={}){
  const derived=row.derived_outputs||{};
  if(!derived.outcome||!derived.decision)return null;
  return {sessionId:row.id,recordedAt:row.submitted_at||derived.outcome.recordedAt||null,outcome:derived.outcome,decision:derived.decision};
}

export function adaptationFromReviewRows(rows=[],interventionId){
  const reviews=rows.map(normalizeReviewRow).filter(Boolean).filter(r=>r.outcome.interventionId===interventionId).sort((a,b)=>String(a.recordedAt||'').localeCompare(String(b.recordedAt||'')));
  return {reviews,policy:decidePlanAdaptation(reviews)};
}

export async function loadActionReviewHistory({userId,planId,interventionId,limit=10}={}){
  if(!userId||!planId||!interventionId)throw new Error('User, plan, and intervention are required.');
  const{data,error}=await supabase.from('el8_assessment_sessions').select('id,submitted_at,trigger_context,derived_outputs').eq('user_id',userId).eq('module_type','plan_review').eq('status','completed').eq('trigger_type','plan_review').contains('trigger_context',{plan_id:planId,intervention_id:interventionId}).order('submitted_at',{ascending:false}).limit(limit);
  if(error)throw error;
  return adaptationFromReviewRows((data||[]).reverse(),interventionId);
}
