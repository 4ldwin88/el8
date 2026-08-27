// Canonical Planning entry point. Planning chooses how to act on member-accepted priorities;
// it does not re-establish Discovery sufficiency or re-rank priorities.
import {REGISTRY,REGISTRY_VERSION} from './problem-intervention-registry.js';
import {eligibleRegistryInterventions} from './problem-registry-adapter.js';

const activeLimit=capacity=>capacity==='none'?0:capacity==='low'?1:2;
const legacyProblemId=problemId=>({
 'problem:low_activity':'P01','problem:poor_sleep':'P02','problem:financial_strain':'P03',
 'problem:execution_gap':'P04','problem:income_gap':'P05','problem:stress':'P06',
 'problem:social_disconnection':'P07','problem:environment_friction':'P08'
}[problemId]||problemId.replace(/^problem:/,''));

export function buildCanonicalPlan(input,{selectionEvidence={},rejectedInterventionIds=[],contraindications=[],now=new Date().toISOString()}={}){
 if(!input||!Number.isInteger(input.memberStateRevision))throw new Error('canonical Planning input is required');
 if(!Array.isArray(input.confirmedPriorityIds)||!Array.isArray(input.problems))throw new Error('confirmed priorities and problems are required');
 if(input.constraints?.safety?.disposition&&input.constraints.safety.disposition!=='ORDINARY_FLOW')return{status:'escalate',reason:'safety_override',active:[],backlog:[],registry_version:REGISTRY_VERSION,memberStateRevision:input.memberStateRevision};
 if(input.constraints?.throttle?.active)return{status:'observe',reason:'capacity_throttle',active:[],backlog:[],registry_version:REGISTRY_VERSION,memberStateRevision:input.memberStateRevision};
 const accepted=new Set(input.confirmedPriorityIds);
 const focuses=input.problems.filter(p=>accepted.has(p.priorityId));
 if(!focuses.length)return{status:'observe',reason:'member_priority_required',active:[],backlog:[],registry_version:REGISTRY_VERSION,memberStateRevision:input.memberStateRevision};
 const groups=focuses.map(focus=>{
  const problem_id=legacyProblemId(focus.problemId);
  const options=eligibleRegistryInterventions(problem_id,{rejectedInterventionIds}).filter(i=>!contraindications.includes(i.id));
  return{focus,problem_id,options};
 }).filter(g=>g.options.length);
 if(!groups.length)return{status:'observe',reason:'no_eligible_registry_intervention',active:[],backlog:[],registry_version:REGISTRY_VERSION,memberStateRevision:input.memberStateRevision};
 const limit=activeLimit(input.constraints?.capacity||'medium');
 const components=groups.flatMap(g=>g.options.map(i=>({id:i.id,intervention_id:i.id,priorityId:g.focus.priorityId,problemId:g.focus.problemId,problem_id:g.problem_id,title:i.memberFacingName,purpose:i.purpose,rationale:i.rationale||`Selected for the member-confirmed ${g.focus.problemId} focus.`,evidenceRefs:[...(g.focus.evidenceRefs||[])],registry_version:REGISTRY_VERSION,status:'backlog'})));
 if(!limit)return{status:'observe',reason:'capacity_hold',active:[],backlog:components,registry_version:REGISTRY_VERSION,memberStateRevision:input.memberStateRevision};
 const active=[],backlog=[];const covered=new Set();
 for(const c of components){if(active.length<limit&&!covered.has(c.priorityId)){active.push({...c,status:'active'});covered.add(c.priorityId)}else backlog.push(c)}
 return{status:'active',reason:'member_accepted_priority',createdAt:now,memberStateRevision:input.memberStateRevision,registry_version:REGISTRY_VERSION,active,actions:active,backlog,selectionEvidence,decisionTrace:{confirmedPriorityIds:[...input.confirmedPriorityIds],selectedInterventionIds:active.map(x=>x.intervention_id),coverageRule:'one-component-per-accepted-priority-before-second-component'}};
}
