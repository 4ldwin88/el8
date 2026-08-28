const clone=x=>JSON.parse(JSON.stringify(x));
const priorityId=id=>`priority:${String(id||'').replace(/^priority:/,'').replace(/^problem:/,'')}`;
function problemFor(state,id){return(state.problems||[]).find(p=>p.sourceConcernId===id||p.id===id||p.id===`problem:${id}`)||null}
export function applyMemberPriorityDecision(state,confirmedPriorities,{at=new Date().toISOString(),decisions={}}={}){
 if(!state||state.schemaVersion!=='1.0.0'||!Number.isInteger(state.revision))throw new Error('canonical Member State is required');
 if(state.baseline?.status!=='ESTABLISHED')throw new Error('completed Discovery baseline is required before Prioritization');
 if(!Array.isArray(confirmedPriorities)||!confirmedPriorities.length)throw new Error('at least one accepted priority is required to continue to Planning');
 const next=clone(state),accepted=new Set(confirmedPriorities),priorities=[],allowed=new Set(['ACCEPTED','REJECTED','POSTPONED','PAUSED']);
 for(const [id,rawStatus] of Object.entries(decisions||{})){const problem=problemFor(state,id);if(!problem||problem.status!=='SUPPORTED')throw new Error(`priority decision requires supported problem: ${id}`);const status=String(rawStatus||'').toUpperCase();if(!allowed.has(status))throw new Error(`unsupported priority decision: ${status}`);if(status==='ACCEPTED')accepted.add(id);priorities.push({id:priorityId(problem.id),problemId:problem.id,status,rank:null,memberDecisionAt:at,evidenceRefs:[...(problem.evidenceRefs||[])]})}
 let rank=0;for(const id of accepted){const problem=problemFor(state,id);if(!problem||problem.status!=='SUPPORTED')throw new Error(`confirmed priority requires supported problem: ${id}`);const existing=priorities.find(p=>p.problemId===problem.id);if(existing){existing.status='ACCEPTED';existing.rank=++rank;existing.memberDecisionAt=at}else priorities.push({id:priorityId(problem.id),problemId:problem.id,status:'ACCEPTED',rank:++rank,memberDecisionAt:at,evidenceRefs:[...(problem.evidenceRefs||[])]})}
 next.priorities=priorities;next.revision=state.revision+1;next.updatedAt=at;next.history=[...(next.history||[]),{revision:next.revision,previousRevision:state.revision,type:'PRIORITIES_UPDATED',at,source:'prioritization:member-decision',decisions:Object.fromEntries(priorities.map(p=>[p.problemId,p.status]))}];return next;
}
