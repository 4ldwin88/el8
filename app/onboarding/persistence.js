import { supabase } from '../../el8-client.js';

const CONCERN_DIMENSION=Object.freeze({money:'Financial',work:'Occupational',sleep:'Physical',health:'Physical',energy:'Physical',stress:'Emotional',relationships:'Social',support:'Social',home:'Environmental',focus:'Intellectual',direction:'Spiritual'});
export const dimensionFor=concernId=>CONCERN_DIMENSION[concernId]||'Physical';

export async function persistDiscovery({userId,memberCode=null,timezone='UTC',output}={}){
  if(!userId||!output?.trace)throw new Error('Discovery persistence requires a completed output.');
  const{data:existing,error:existingError}=await supabase.from('el8_assessment_sessions').select('id').eq('user_id',userId).eq('module_type','discovery').eq('status','completed').eq('trigger_type','onboarding').order('submitted_at',{ascending:false}).limit(1).maybeSingle();
  if(existingError)throw existingError;if(existing)return existing;
  const trace=output.trace,now=new Date().toISOString(),row={user_id:userId,member_code:memberCode,module_id:'DISCOVERY-R3',module_version:'3',module_type:'discovery',status:'completed',trigger_type:'onboarding',trigger_context:{source:'universal_baseline'},responses:{observations:trace.observations||[],priority_choices:trace.priorityChoices||[]},derived_outputs:{states:trace.states||[],plan:output.plan||trace.memberPlan||null,trace},safety_flags:[],evidence_context:{active_concerns:trace.activeConcerns||[]},local_timezone:timezone,started_at:trace.timing?.assessmentStart||now,submitted_at:trace.timing?.assessmentCompleted||now,updated_at:now,active_duration_seconds:Math.round(trace.timing?.totalDurationSeconds||0),interaction_count:trace.questionsAsked||0,background_duration_seconds:0};
  const{data,error}=await supabase.from('el8_assessment_sessions').insert(row).select('id').single();if(error)throw error;return data;
}

export async function persistInitialPlan({userId,plan,discoveryOutput}={}){
  if(!userId||!plan?.accepted||!plan.interventions?.length)throw new Error('Accepted initial plan is required.');
  const interventions=plan.interventions.map((a,i)=>({id:a.id,order:i+1,action:a.title||a.label||a.id,dimensions:[dimensionFor(a.concernId)],concern_id:a.concernId||null,intent:a.intent||null,rationale:a.why||null,measurement:a.measurement||null,time_horizon:a.timeHorizon||`${plan.reviewDays}-days`,effort:a.effort??null,source:'discovery-round-3'}));
  const focus=[...new Map(interventions.map((a,i)=>[a.dimensions[0],{dimension:a.dimensions[0],role:i===0?'lead':'linked',source:'discovery-round-3'}])).values()],primary=interventions[0],supporting=interventions[1]||null;
  const payload={accepted:true,dimension:primary.dimensions[0],supporting_dimension:supporting?.dimensions?.[0]||'',primary_action:primary.action,supporting_action:supporting?.action||'',measure:primary.measurement||'Plan review evidence',review_days:plan.reviewDays,rationale:plan.explanation||null,actions:interventions.map(a=>({action:a.action,dimension:a.dimensions[0]})),generated_from:{discovery_version:'round-3',discovery_trace:discoveryOutput?.trace||null,accepted_at:plan.acceptedAt},focus_dimensions:focus,interventions,capacity:{max_actions:2,review_days:plan.reviewDays},plan_objective:'Start with the smallest useful plan and review evidence before adapting.'};
  const{data,error}=await supabase.rpc('el8_accept_initial_plan',{p_plan:payload});if(error)throw error;return data;
}
