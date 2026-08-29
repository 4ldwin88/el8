// Browser compatibility edge for the onboarding journey.
// Translates already-resolved Discovery output + explicit member focus into canonical Planning input.
// This module does not rank priorities or select interventions; canonical Planning retains that authority.
import {canonicalMemberProblemId} from './canonical-problem-map.js';

const clone=x=>JSON.parse(JSON.stringify(x));
const priorityId=x=>`priority:${String(x||'').replace(/^priority:/,'').replace(/^problem:/,'')}`;
function rows(output={}){return output.trace?.states||[]}
function findRow(output,id){const canonical=canonicalMemberProblemId(id);return rows(output).find(x=>{const values=[x.concernId,x.sourceConcernId,x.id,x.driver,x.problemId];return values.includes(id)||values.some(value=>canonicalMemberProblemId(value)===canonical)})||null}
export function canonicalPlanningInputFromBrowser({discoveryOutput,confirmedPriorities,memberStateRevision}){
 if(!discoveryOutput||!Array.isArray(confirmedPriorities)||!confirmedPriorities.length)throw new Error('Discovery output and confirmed priorities are required');
 if(!Number.isInteger(memberStateRevision)||memberStateRevision<0)throw new Error('Canonical Member State revision is required');
 const problems=confirmedPriorities.map(id=>{const pid=canonicalMemberProblemId(id);if(!pid)throw new Error(`Unsupported confirmed priority: ${id}`);const row=findRow(discoveryOutput,id)||{};return{priorityId:priorityId(pid),problemId:pid,evidenceRefs:[...(row.evidenceRefs||row.observationRefs||[])],priorLearning:[]}});
 const feasibility=discoveryOutput.baselineHandoff?.signals?.feasibility||{};
 const capacity=feasibility.capacity??null;
 return{memberStateRevision,confirmedPriorityIds:problems.map(x=>x.priorityId),memberChoice:{mode:'EXPLICIT_ACCEPTANCE'},problems,priorityOrder:problems.map((x,i)=>({priorityId:x.priorityId,rank:i+1})),priorityOrderResolved:true,constraints:{profile:[],capacity,manageability:feasibility.overall_load||null,throttle:{active:false},safety:{disposition:'ORDINARY_FLOW'}}};
}
export function canonicalBrowserPlanView(plan={}){const active=plan.active||plan.actions||[];const blocking=active.flatMap(a=>(a.deepeningRequirements||[]).filter(r=>r.requiredBeforeActivation!==false));return{status:plan.status||'observe',reason:plan.reason||null,actions:clone(active),backlog:clone(plan.backlog||[]),selectionDeepening:{required:plan.status==='deepen'&&plan.reason==='selection_evidence_required',requirements:clone(plan.selectionDeepening?.requirements||[])},activationStatus:blocking.length?'needs_plan_specific_assessment':plan.status==='active'?'ready':null,deepening:{blocking:clone(blocking)}}}
