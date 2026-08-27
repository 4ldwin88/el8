import {PROBLEM_REGISTRY,REGISTRY_VERSION} from './problem-intervention-registry.js';

const LEGACY_TO_PROBLEM={
 low_activity:'P01',poor_sleep:'P02',money_pressure:'P03',low_focus:'P04',work_instability:'P05',stress:'P06',low_support:'P07',home_instability:'P08'
};
const PURPOSE_ORDER={ACT:0,RESOLVE:1,CONNECT:2,TRACK:3,LEARN:4,DEEPEN:5,ESCALATE:6};

export function canonicalProblemId(id){
 if(!id)return null;
 if(PROBLEM_REGISTRY.problems?.[id])return id;
 return LEGACY_TO_PROBLEM[id]||null;
}

export function problemHypothesesFromDiscovery(discovery={}){
 const ranked=discovery.ranked||discovery.priorities||discovery.candidates||[];
 return ranked.map((x,index)=>{
  const problemId=canonicalProblemId(x.problem_id||x.problemId||x.id||x.concernId);
  if(!problemId)return null;
  return {problem_id:problemId,legacy_driver:x.id||x.concernId||null,confidence:Number(x.confidence??x.evidenceConfidence??0),member_importance:Number(x.memberImportance??x.member_importance??0),readiness:Number(x.readiness??0),mechanism_id:x.mechanism_id||x.mechanismId||null,evidence_ids:[...(x.evidenceIds||x.evidence_ids||[])],suppression_evidence:[...(x.suppressionEvidence||[])],contradiction_evidence:[...(x.contradictionEvidence||[])],feasibility:x.feasibility||{},rank:index+1};
 }).filter(Boolean);
}

export function registryProblem(problemId){return PROBLEM_REGISTRY.problems?.[canonicalProblemId(problemId)]||null;}

export function eligibleRegistryInterventions(problemId,{mechanismId=null,rejectedInterventionIds=[],purpose=null}={}){
 const problem=registryProblem(problemId);if(!problem)return[];
 return (problem.intervention_ids||[]).map(id=>PROBLEM_REGISTRY.interventions?.[id]).filter(Boolean).filter(x=>!rejectedInterventionIds.includes(x.intervention_id)).filter(x=>!mechanismId||!(x.mechanism_ids||[]).length||(x.mechanism_ids||[]).includes(mechanismId)).filter(x=>!purpose||x.purpose===purpose).sort((a,b)=>(PURPOSE_ORDER[a.purpose]??99)-(PURPOSE_ORDER[b.purpose]??99));
}

export function selectRegistryIntervention(hypothesis,options={}){
 const problemId=canonicalProblemId(hypothesis?.problem_id||hypothesis?.id);if(!problemId)return null;
 const candidates=eligibleRegistryInterventions(problemId,{mechanismId:hypothesis.mechanism_id,rejectedInterventionIds:options.rejectedInterventionIds||[]});
 const chosen=candidates[0];if(!chosen)return null;
 const problem=registryProblem(problemId);
 return {problem_id:problemId,problem_label:problem.label,mechanism_id:hypothesis.mechanism_id||null,intervention_id:chosen.intervention_id,registry_version:REGISTRY_VERSION,purpose:chosen.purpose,rationale:chosen.rationale,evidence_strength:chosen.evidence_strength,action_templates:[...(chosen.action_templates||[])],measurement:{...(chosen.measurement||{})},review_rule:{...(chosen.review_rule||{})},cross_dimensional_hypotheses:[...(problem.cross_dimensional_hypotheses||[])],alternatives:candidates.slice(1).map(x=>({intervention_id:x.intervention_id,name:x.member_facing_name,purpose:x.purpose,rationale:x.rationale})),decision_trace:{problem_id:problemId,discovery_evidence_ids:[...(hypothesis.evidence_ids||[])],confidence:hypothesis.confidence??null,member_importance:hypothesis.member_importance??null,rejected_intervention_ids:[...(options.rejectedInterventionIds||[])]}};
}

export function registryPlanningCandidates(discovery={},options={}){
 return problemHypothesesFromDiscovery(discovery).map(h=>selectRegistryIntervention(h,options)).filter(Boolean);
}
