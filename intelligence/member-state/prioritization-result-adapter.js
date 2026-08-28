'use strict';
const {assertMemberState}=require('./member-state');
const {applyMemberStateUpdate}=require('./member-state-update');

function applyPrioritizationResult(state,result,{at,source='prioritization'}={}){
 assertMemberState(state);
 if(!result||typeof result!=='object')throw new Error('prioritization result is required');
 if(result.memberStateRevision!==state.revision)throw new Error(`prioritization result revision conflict: expected ${result.memberStateRevision}, actual ${state.revision}`);
 if(result.blockedBySafety&&result.priorityItems?.length)throw new Error('safety-blocked Prioritization cannot recommend priorities');
 let next=state;
 for(const item of result.priorityItems||[]){
  if(!item.problemId)throw new Error('priority problemId is required');
  const problem=next.problems.find(p=>p.id===item.problemId);
  if(!problem||problem.status!=='SUPPORTED')throw new Error('priority must reference a supported canonical problem');
  next=applyMemberStateUpdate(next,{type:'PRIORITY_UPDATED',at,source,expectedRevision:next.revision,reason:'canonical Prioritization recommendation',refs:[...(item.evidenceRefs||[])],payload:{id:item.priorityId||`priority:${item.problemId.replace(/^problem:/,'')}`,problemId:item.problemId,status:'RECOMMENDED',rank:item.rank,rationaleCodes:[...(item.rationaleCodes||[])],decisionFactors:{...(item.decisionFactors||{})},recommendedAt:at,memberDecisionAt:null}});
 }
 return next;
}

function recordPriorityDecision(state,{priorityId,decision,at,source='member.priority-choice'}){
 const allowed=['ACCEPTED','REJECTED','POSTPONED','PAUSED'];
 if(!allowed.includes(decision))throw new Error('invalid member priority decision');
 const existing=state.priorities.find(p=>p.id===priorityId);
 if(!existing)throw new Error('priority does not exist');
 return applyMemberStateUpdate(state,{type:'PRIORITY_UPDATED',at,source,expectedRevision:state.revision,reason:'explicit member priority decision',refs:[],payload:{id:priorityId,status:decision,memberDecisionAt:at}});
}
module.exports={applyPrioritizationResult,recordPriorityDecision};
