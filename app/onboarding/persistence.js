import { supabase } from '../../el8-client.js';

const CONCERN_DIMENSION=Object.freeze({money:'Financial',money_pressure:'Financial',work:'Occupational',work_instability:'Occupational',sleep:'Physical',poor_sleep:'Physical',health:'Physical',physical_condition:'Physical',low_activity:'Physical',energy:'Physical',low_energy:'Physical',stress:'Emotional',relationships:'Social',relationship_strain:'Social',support:'Social',low_support:'Social',home:'Environmental',home_instability:'Environmental',focus:'Intellectual',low_focus:'Intellectual',direction:'Spiritual',lack_direction:'Spiritual'});
export const dimensionFor=concernId=>CONCERN_DIMENSION[concernId]||'Physical';

export async function persistDiscovery({userId,memberCode=null,timezone='UTC',output}={}){
  if(!userId||!output?.trace)throw new Error('Discovery persistence requires a completed output.');
  const{data:existing,error:existingError}=await supabase.from('el8_assessment_sessions').select('id').eq('user_id',userId).eq('module_type','discovery').eq('status','completed').eq('trigger_type','onboarding').order('submitted_at',{ascending:false}).limit(1).maybeSingle();
  if(existingError)throw existingError;if(existing)return existing;
  const trace=output.trace,now=new Date().toISOString(),row={user_id:userId,member_code:memberCode,module_id:'DISCOVERY-R3',module_version:'3',module_type:'discovery',status:'completed',trigger_type:'onboarding',trigger_context:{source:'universal_baseline'},responses:{observations:trace.observations||[],priority_choices:trace.priorityChoices||[]},derived_outputs:{states:trace.states||[],plan:output.plan||trace.memberPlan||null,trace},safety_flags:[],evidence_context:{active_concerns:trace.activeConcerns||[]},local_timezone:timezone,started_at:trace.timing?.assessmentStart||now,submitted_at:trace.timing?.assessmentCompleted||now,updated_at:now,active_duration_seconds:Math.round(trace.timing?.totalDurationSeconds||0),interaction_count:trace.questionsAsked||0,background_duration_seconds:0};
  const{data,error}=await supabase.from('el8_assessment_sessions').insert(row).select('id').single();if(error)throw error;return data;
}

function canonicalInterventions(plan={}){
  return (plan.active||plan.actions||[]).map((a,i)=>({id:a.id,order:i+1,action:a.title||a.label||a.id,dimensions:[dimensionFor(a.driver||a.concernId)],concern_id:a.driver||a.concernId||null,intent:a.type||null,rationale:a.rationale||null,measurement:a.measurement||null,success_signal:a.successSignal||null,time_horizon:a.reviewDays?`${a.reviewDays}-days`:null,effort:a.effort??null,source:'adaptive-plan',deepening_requirements:(plan.deepening?.requirements||[]).filter(r=>r.actionId===a.id)}));
}

export async function persistAdaptiveInitialPlan({userId,plan,discoveryOutput}={}){
  const interventions=canonicalInterventions(plan);
  if(!userId||plan?.status!=='active'||!interventions.length)throw new Error('An active adaptive plan is required.');
  if(plan.activationStatus==='needs_plan_specific_assessment')throw new Error('Complete the plan-specific assessment before activating this plan.');
  const focus=[...new Map(interventions.map((a,i)=>[a.dimensions[0],{dimension:a.dimensions[0],role:i===0?'lead':'linked',source:'adaptive-plan'}])).values()],primary=interventions[0],supporting=interventions[1]||null,acceptedAt=new Date().toISOString();
  const payload={accepted:true,version:'adaptive-plan-v1',dimension:primary.dimensions[0],supporting_dimension:supporting?.dimensions?.[0]||'',primary_action:primary.action,supporting_action:supporting?.action||'',measure:primary.measurement||'Plan review evidence',review_days:plan.reviewDays||7,rationale:plan.uncertainty||null,actions:interventions.map(a=>({action:a.action,dimension:a.dimensions[0],id:a.id})),generated_from:{discovery_version:'round-3',discovery_trace:discoveryOutput?.trace||null,accepted_at:acceptedAt,decision_trace:plan.decisionTrace||null,evidence_used:plan.evidenceUsed||[]},focus_dimensions:focus,interventions,capacity:{max_actions:interventions.length,review_days:plan.reviewDays||7,member_fit:plan.memberFit||null},activation_status:plan.activationStatus||'ready',deepening:plan.deepening||null,plan_objective:'Start with the smallest evidence-supported plan, deepen only where the selected action requires it, and review outcomes before adapting.'};
  const{data,error}=await supabase.rpc('el8_accept_initial_plan',{p_plan:payload});if(error)throw error;return data;
}
