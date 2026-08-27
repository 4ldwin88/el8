// Canonical Planning entry point. Planning chooses how to act on member-accepted priorities;
// it does not re-establish Discovery sufficiency or re-rank priorities.
import {REGISTRY,REGISTRY_VERSION} from './problem-intervention-registry.js';
import {eligibleRegistryInterventions} from './problem-registry-adapter.js';
import {missingSelectionRequirements} from './selection-evidence.js';

const activeLimit=capacity=>capacity==='none'?0:capacity==='low'?1:2;
const canonicalProblemId=problemId=>({'problem:low_activity':'P01','problem:poor_sleep':'P02','problem:financial_strain':'P03','problem:execution_gap':'P04','problem:income_gap':'P05','problem:stress':'P06','problem:social_disconnection':'P07','problem:environment_friction':'P08'}[problemId]||problemId.replace(/^problem:/,''));
const purposeRank={ESCALATE:0,DEEPEN:1,RESOLVE:2,ACT:3,CONNECT:3,TRACK:4,LEARN:5};
function effort(i){const n=Number(i.burden?.effort);return Number.isFinite(n)?n:null}
function selectionInput(focuses){return focuses.map(f=>({id:canonicalProblemId(f.problemId),problem_id:canonicalProblemId(f.problemId)}))}
function component(group,i){return{id:i.id,intervention_id:i.id,priorityId:group.focus.priorityId,problemId:group.focus.problemId,problem_id:group.problem_id,title:i.memberFacingName,purpose:i.purpose,rationale:i.rationale||`Selected for the member-confirmed ${group.focus.problemId} focus.`,evidenceRefs:[...(group.focus.evidenceRefs||[])],evidenceStrength:i.evidenceStrength,burden:{...(i.burden||{})},effort:effort(i),actionTemplates:[...(i.actionTemplates||[])],measurement:{...(i.measurement||{})},reviewRule:{...(i.reviewRule||{})},registry_version:REGISTRY_VERSION,status:'backlog'}}
export function buildCanonicalPlan(input,{selectionEvidence={},rejectedInterventionIds=[],contraindications=[],adaptationConstraint=null,previousInterventionIds=[],maxEffort=null,now=new Date().toISOString()}={}){
 if(!input||!Number.isInteger(input.memberStateRevision))throw new Error('canonical Planning input is required');
 if(!Array.isArray(input.confirmedPriorityIds)||!Array.isArray(input.problems))throw new Error('confirmed priorities and problems are required');
 if(input.constraints?.safety?.disposition&&input.constraints.safety.disposition!=='ORDINARY_FLOW')return{status:'escalate',reason:'safety_override',active:[],backlog:[],registry_version:REGISTRY_VERSION,memberStateRevision:input.memberStateRevision};
 if(input.constraints?.throttle?.active)return{status:'observe',reason:'capacity_throttle',active:[],backlog:[],registry_version:REGISTRY_VERSION,memberStateRevision:input.memberStateRevision};
 const accepted=new Set(input.confirmedPriorityIds),focuses=input.problems.filter(p=>accepted.has(p.priorityId));
 if(!focuses.length)return{status:'observe',reason:'member_priority_required',active:[],backlog:[],registry_version:REGISTRY_VERSION,memberStateRevision:input.memberStateRevision};
 const missing=missingSelectionRequirements(selectionInput(focuses),selectionEvidence);
 if(missing.length)return{status:'deepen',reason:'selection_evidence_required',active:[],backlog:[],registry_version:REGISTRY_VERSION,memberStateRevision:input.memberStateRevision,selectionDeepening:{required:true,requirements:missing},confirmedPriorityIds:[...input.confirmedPriorityIds]};
 const groups=focuses.map(focus=>{const problem_id=canonicalProblemId(focus.problemId);let options=eligibleRegistryInterventions(problem_id,{rejectedInterventionIds}).filter(i=>!contraindications.includes(i.id)&&!rejectedInterventionIds.includes(i.id));if(adaptationConstraint==='different_intervention')options=options.filter(i=>!previousInterventionIds.includes(i.id));if(adaptationConstraint==='reduce_burden'&&Number.isFinite(Number(maxEffort)))options=options.filter(i=>effort(i)==null||effort(i)<=Number(maxEffort));options.sort((a,b)=>adaptationConstraint==='reduce_burden'?((effort(a)??99)-(effort(b)??99)):((purposeRank[a.purpose]??99)-(purposeRank[b.purpose]??99)));return{focus,problem_id,options}}).filter(g=>g.options.length);
 if(!groups.length)return{status:'observe',reason:'no_eligible_registry_intervention',active:[],backlog:[],registry_version:REGISTRY_VERSION,memberStateRevision:input.memberStateRevision};
 const components=groups.flatMap(g=>g.options.map(i=>component(g,i))),limit=activeLimit(input.constraints?.capacity||'medium');
 if(!limit)return{status:'observe',reason:'capacity_hold',active:[],backlog:components,registry_version:REGISTRY_VERSION,memberStateRevision:input.memberStateRevision};
 const active=[],backlog=[],covered=new Set();for(const c of components){if(active.length<limit&&!covered.has(c.priorityId)){active.push({...c,status:'active'});covered.add(c.priorityId)}else backlog.push(c)}
 return{status:'active',reason:'member_accepted_priority',createdAt:now,memberStateRevision:input.memberStateRevision,registry_version:REGISTRY_VERSION,active,actions:active,backlog,selectionEvidence,decisionTrace:{confirmedPriorityIds:[...input.confirmedPriorityIds],selectedInterventionIds:active.map(x=>x.intervention_id),coverageRule:'one-component-per-accepted-priority-before-second-component',rejectedInterventionIds:[...rejectedInterventionIds],adaptationConstraint}};
}
