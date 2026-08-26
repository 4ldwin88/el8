import {buildPlan} from '../../intelligence/planning/plan-engine.js';

export function reassessmentQuestions({kind='reassess',dimension=null}={}){
  const priority=kind==='reprioritize';
  return [
    {id:'still_priority',label:priority?'Is this still the area you most want EL8 to focus on?':'Does this still feel like the right problem to work on?',type:'choice',options:['yes','partly','no']},
    {id:'what_changed',label:'What has changed since this plan started?',type:'text',optional:true},
    {id:'main_barrier',label:'What most affected the plan?',type:'choice',options:['action_fit','time_or_energy','external_change','measurement','priority_changed','other']},
    {id:'capacity',label:'How much change feels realistic right now?',type:'choice',options:['one_small_action','two_small_actions','normal']},
    {id:'desired_outcome',label:`What would meaningful progress${dimension?` in ${dimension}`:''} look like now?`,type:'text'}
  ];
}

export function reassessmentCandidates({kind='reassess',sourcePlan,responses={},drivers=[],rejectedActionIds=[]}={}){
  if(!sourcePlan)throw new Error('A source plan is required.');
  const dimension=responses.new_dimension||sourcePlan.dimension;
  const supported=(drivers||[]).filter(d=>d?.id&&Number(d.confidence)>=.55).filter(d=>!dimension||!d.dimension||String(d.dimension).toLowerCase()===String(dimension).toLowerCase());
  if(!supported.length)return {status:'observe',reason:'insufficient_driver_evidence',active:[],backlog:[]};
  const capacity=responses.capacity==='one_small_action'?'low':'medium';
  return buildPlan({ranked:supported},{capacity,consent:true,rejectedActionIds,evidence:responses.evidence||{}});
}

export function deriveReassessmentDecision({kind='reassess',sourcePlan,responses={},candidateActions=[],drivers=[],rejectedActionIds=[]}={}){
  if(!sourcePlan)throw new Error('A source plan is required.');
  if(!responses.desired_outcome?.trim())return {ready:false,reason:'desired_outcome_required'};
  if(kind==='reprioritize'&&responses.still_priority==='no'&&!responses.new_dimension)return {ready:false,reason:'new_priority_required'};
  const dimension=responses.new_dimension||sourcePlan.dimension;
  const maxActions=responses.capacity==='one_small_action'?1:2;
  const composed=drivers.length?reassessmentCandidates({kind,sourcePlan,responses,drivers,rejectedActionIds}):null;
  if(composed&&composed.status!=='active')return {ready:false,reason:composed.reason,dimension,maxActions,evidenceUsed:composed.evidenceUsed||[]};
  const candidates=(composed?.active||candidateActions).filter(a=>!dimension||!a.dimension||String(a.dimension).toLowerCase()===String(dimension).toLowerCase()).slice(0,maxActions);
  if(!candidates.length)return {ready:false,reason:'candidate_action_required',dimension,maxActions};
  const interventions=candidates.map((a,i)=>({id:a.id||`adaptive-${i+1}`,action:a.action||a.title,dimensions:a.dimensions||[a.dimension||dimension].filter(Boolean),driver:a.driver||null,supportingDrivers:a.supportingDrivers||[],confidence:a.confidence??null,rationale:a.rationale||null,measurement:a.measurement||null,successSignal:a.successSignal||null,deepeningRequirements:a.deepeningRequirements||[]}));
  return {ready:true,requiresMemberConfirmation:true,evidenceUsed:composed?.evidenceUsed||[],decisionTrace:composed?.decisionTrace||null,decision:{confirmed:false,dimension,primaryAction:interventions[0].action,supportingAction:interventions[1]?.action||'',focusDimensions:[dimension].filter(Boolean),interventions,actions:interventions.map(x=>({action:x.action,dimension})),capacity:{maxConcurrentActions:maxActions},planObjective:responses.desired_outcome.trim(),rationale:responses.what_changed?.trim()||`Focused ${kind} based on current member evidence.`}};
}
