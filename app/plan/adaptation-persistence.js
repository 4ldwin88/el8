import {supabase}from'../../el8-client.js';

export async function persistAdaptationTransaction({userId,memberCode=null,transaction,timezone='UTC'}={}){
  if(!userId||transaction?.status!=='confirmed')throw new Error('A confirmed adaptation transaction is required.');
  if(transaction.mutationStatus!=='not_applied')throw new Error('Only unapplied adaptation intent may be recorded here.');
  const now=transaction.confirmedAt||new Date().toISOString();
  const row={user_id:userId,member_code:memberCode,module_id:'ADAPTIVE-PLAN-CHANGE',module_version:'1',module_type:'plan_adaptation',status:'completed',trigger_type:'member_confirmation',trigger_context:{plan_id:transaction.planId,intervention_id:transaction.interventionId},responses:{confirmed:true,member_instruction:transaction.memberInstruction},derived_outputs:{transaction},safety_flags:[],evidence_context:{review_session_ids:transaction.reviewSessionIds},local_timezone:timezone,started_at:now,submitted_at:now,updated_at:now,active_duration_seconds:0,interaction_count:1,background_duration_seconds:0};
  const{data,error}=await supabase.from('el8_assessment_sessions').insert(row).select('id').single();if(error)throw error;return data;
}
