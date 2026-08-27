'use strict';
const {assertMemberState}=require('./member-state');
const {applyMemberStateUpdate}=require('./member-state-update');

function applyCanonicalPlanResult(state,result,{at,source='planning.canonical'}={}){
 assertMemberState(state);
 if(!result||typeof result!=='object')throw new Error('canonical plan result is required');
 if(result.memberStateRevision!==state.revision)throw new Error(`plan result revision conflict: expected ${result.memberStateRevision}, actual ${state.revision}`);
 if(result.status!=='active')return state;
 const accepted=new Set(state.priorities.filter(p=>p.status==='ACCEPTED').map(p=>p.id));
 const interventions=(result.active||[]).map(item=>{
  if(!accepted.has(item.priorityId))throw new Error(`plan intervention requires accepted priority: ${item.priorityId}`);
  const priority=state.priorities.find(p=>p.id===item.priorityId);
  if(!priority||priority.problemId!==item.problemId)throw new Error('plan intervention problem must match accepted priority');
  const problem=state.problems.find(p=>p.id===item.problemId);
  if(!problem||problem.status!=='SUPPORTED')throw new Error('plan intervention requires supported problem');
  return {id:item.intervention_id||item.id,priorityId:item.priorityId,problemId:item.problemId,status:item.status||'active',title:item.title||null,purpose:item.purpose||null,selectionMechanism:item.selectionMechanism||null,evidenceRefs:[...(item.evidenceRefs||[])],burden:{...(item.burden||{})},actionTemplates:[...(item.actionTemplates||[])],measurement:{...(item.measurement||{})},reviewRule:{...(item.reviewRule||{})},registryVersion:item.registry_version||result.registry_version||null,activatedAt:at};
 });
 return applyMemberStateUpdate(state,{type:'PLAN_UPDATED',at,source,expectedRevision:state.revision,reason:'canonical Planning result accepted for persistence',refs:interventions.flatMap(i=>i.evidenceRefs),payload:{planId:`plan:${state.memberId}:${state.revision+1}`,status:'ACTIVE',interventions,backlog:(result.backlog||[]).map(i=>({id:i.intervention_id||i.id,priorityId:i.priorityId,problemId:i.problemId,status:'backlog'})),reviewDays:result.reviewDays??null,activationStatus:result.activationStatus||'ready',registryVersion:result.registry_version||null,planningRevision:result.memberStateRevision,decisionTrace:{...(result.decisionTrace||{})}}});
}
module.exports={applyCanonicalPlanResult};
