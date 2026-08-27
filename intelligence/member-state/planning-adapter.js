'use strict';
const {assertMemberState}=require('./member-state');

function projectPlanningInput(state,{priorityIds=null}={}){
 assertMemberState(state);
 const accepted=state.priorities.filter(p=>p.status==='ACCEPTED'&&(!priorityIds||priorityIds.includes(p.id)));
 if(priorityIds){
  const missing=priorityIds.filter(id=>!accepted.some(p=>p.id===id));
  if(missing.length)throw new Error(`Planning requires accepted member priorities: ${missing.join(', ')}`);
 }
 return {
  memberStateRevision:state.revision,
  confirmedPriorityIds:accepted.map(p=>p.id),
  memberChoice:{mode:'EXPLICIT_ACCEPTANCE',decisionRefs:accepted.map(p=>({priorityId:p.id,memberDecisionAt:p.memberDecisionAt}))},
  problems:accepted.map(priority=>{
   const problem=state.problems.find(p=>p.id===priority.problemId);
   if(!problem||problem.status!=='SUPPORTED')throw new Error(`accepted priority must reference supported problem: ${priority.id}`);
   return {priorityId:priority.id,problemId:problem.id,evidenceRefs:[...(problem.evidenceRefs||[])],hypotheses:state.hypotheses.filter(h=>h.problemId===problem.id||h.problemIds?.includes(problem.id)),priorLearning:state.learning.filter(l=>l.problemId===problem.id||l.priorityId===priority.id)};
  }),
  constraints:{profile:[...(state.profile.constraints||[])],capacity:state.engagementBurden.capacity,manageability:state.engagementBurden.manageability,throttle:{...state.engagementBurden.throttle},safety:{...state.safety}},
 };
}
module.exports={projectPlanningInput};
