// Browser compatibility edge for the onboarding journey.
// Translates already-resolved Discovery output + explicit member focus into canonical Planning input.
// This module does not rank priorities or select interventions; canonical Planning retains that authority.

const PROBLEM_BY_CONCERN=Object.freeze({
  physical_condition:'problem:low_activity',low_activity:'problem:low_activity',low_energy:'problem:low_activity',
  poor_sleep:'problem:poor_sleep',
  money:'problem:financial_strain',money_pressure:'problem:financial_strain',
  work_pressure:'problem:income_gap',work_instability:'problem:income_gap',
  low_direction:'problem:execution_gap',lack_direction:'problem:execution_gap',low_focus:'problem:execution_gap',schedule_disruption:'problem:execution_gap',
  stress:'problem:stress',
  relationship_strain:'problem:social_disconnection',low_support:'problem:social_disconnection',
  home_instability:'problem:environment_friction'
});
const clone=x=>JSON.parse(JSON.stringify(x));
const problemId=x=>PROBLEM_BY_CONCERN[x]||(/^problem:/.test(String(x||''))?x:`problem:${x}`);
const priorityId=x=>`priority:${String(x||'').replace(/^priority:/,'')}`;
function rows(output={}){return output.trace?.states||output.ranked||output.selected||output.priorityCandidates||output.candidates||[]}
function findRow(output,id){return rows(output).find(x=>[x.concernId,x.sourceConcernId,x.id,x.driver,x.problemId].includes(id))||null}
export function canonicalPlanningInputFromBrowser({discoveryOutput,confirmedPriorities,memberStateRevision}){
 if(!discoveryOutput||!Array.isArray(confirmedPriorities)||!confirmedPriorities.length)throw new Error('Discovery output and confirmed priorities are required');
 if(!Number.isInteger(memberStateRevision)||memberStateRevision<0)throw new Error('Canonical Member State revision is required');
 const problems=confirmedPriorities.map((id,index)=>{const row=findRow(discoveryOutput,id)||{};const pid=problemId(row.problemId||row.id||id);return{priorityId:priorityId(id),problemId:pid,evidenceRefs:[...(row.evidenceRefs||row.observationRefs||[])],priorLearning:[]}});
 const feasibility=discoveryOutput.baselineHandoff?.signals?.feasibility||discoveryOutput.baselineHandoff?.signals?.legacy?.feasibility||{};
 const capacity=discoveryOutput.baselineHandoff?.signals?.feasibility?.capacity||discoveryOutput.baselineCapacity||(['Overwhelming','Difficult'].includes(feasibility.overall_load)||feasibility.time==='<5 min'?'low':'medium');
 return{memberStateRevision,confirmedPriorityIds:problems.map(x=>x.priorityId),memberChoice:{mode:'EXPLICIT_ACCEPTANCE'},problems,priorityOrder:problems.map((x,i)=>({priorityId:x.priorityId,rank:i+1})),priorityOrderResolved:true,constraints:{profile:[],capacity,manageability:feasibility.overall_load||null,throttle:{active:false},safety:{disposition:'ORDINARY_FLOW'}}};
}
export function canonicalBrowserPlanView(plan={}){const active=plan.active||plan.actions||[];const blocking=active.flatMap(a=>(a.deepeningRequirements||[]).filter(r=>r.requiredBeforeActivation!==false));return{status:plan.status||'observe',reason:plan.reason||null,actions:clone(active),backlog:clone(plan.backlog||[]),selectionDeepening:{required:plan.status==='deepen'&&plan.reason==='selection_evidence_required',requirements:clone(plan.selectionDeepening?.requirements||[])},activationStatus:blocking.length?'needs_plan_specific_assessment':plan.status==='active'?'ready':null,deepening:{blocking:clone(blocking)}}}
