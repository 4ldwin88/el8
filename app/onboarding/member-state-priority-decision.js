const clone=x=>JSON.parse(JSON.stringify(x));
const priorityId=id=>`priority:${String(id||'').replace(/^priority:/,'')}`;
function problemFor(state,id){return(state.problems||[]).find(p=>p.sourceConcernId===id||p.id===id||p.id===`problem:${id}`)||null}
export function applyMemberPriorityDecision(state,confirmedPriorities,{at=new Date().toISOString()}={}){
 if(!state||state.schemaVersion!=='1.0.0'||!Number.isInteger(state.revision))throw new Error('canonical Member State is required');
 if(!Array.isArray(confirmedPriorities)||!confirmedPriorities.length)throw new Error('confirmed priorities are required');
 const next=clone(state),priorities=[];
 confirmedPriorities.forEach((id,index)=>{const problem=problemFor(state,id);if(!problem||problem.status!=='SUPPORTED')throw new Error(`confirmed priority requires supported problem: ${id}`);priorities.push({id:priorityId(id),problemId:problem.id,status:'ACCEPTED',rank:index+1,memberDecisionAt:at,evidenceRefs:[...(problem.evidenceRefs||[])]})});
 next.priorities=priorities;next.revision=state.revision+1;next.updatedAt=at;next.history=[...(next.history||[]),{revision:next.revision,previousRevision:state.revision,type:'PRIORITIES_UPDATED',at,source:'prioritization:member-confirmation'}];return next;
}
