import { supabase } from '../../el8-client.js';

export async function persistActionReview({userId,memberCode=null,planId,review,timezone='UTC'}={}){
  if(!userId||!planId||!review?.outcome||!review?.decision)throw new Error('A completed action review is required.');
  const outcome=review.outcome,decision=review.decision,now=outcome.recordedAt||new Date().toISOString();
  const actionId=outcome.actionId||review.actionId||null;
  const focusIds=[...new Set([...(outcome.focusIds||[]),...(review.focusIds||[])])].filter(Boolean);
  const constructIds=[...new Set([...(outcome.constructIds||[]),...(review.constructIds||[])])].filter(Boolean);
  if(!actionId)throw new Error('Canonical Action review requires actionId.');
  const row={user_id:userId,member_code:memberCode,module_id:'ADAPTIVE-PLAN-REVIEW',module_version:'2',module_type:'plan_review',status:'completed',trigger_type:'plan_review',trigger_context:{plan_id:planId,action_id:actionId,focus_ids:focusIds,construct_ids:constructIds},responses:{status:outcome.status,adherence:outcome.adherence,benefit_direction:outcome.benefitDirection,barrier_codes:outcome.barrierCodes,burden:outcome.burden,context_changed:outcome.contextChanged,safety_changed:outcome.safetyChanged,measurement_sufficient:outcome.measurementSufficient},derived_outputs:{outcome:{...outcome,actionId,focusIds,constructIds},decision},safety_flags:outcome.safetyChanged?['plan_review_safety_change']:[],evidence_context:{action_id:actionId,focus_ids:focusIds,construct_ids:constructIds,observation_refs:outcome.observationRefs||[],evidence_refs:outcome.evidenceRefs||[]},local_timezone:timezone,started_at:now,submitted_at:now,updated_at:now,active_duration_seconds:0,interaction_count:1,background_duration_seconds:0};
  const{data,error}=await supabase.from('el8_assessment_sessions').insert(row).select('id').single();if(error)throw error;return data;
}
