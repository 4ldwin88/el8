'use strict';
const {assertMemberState}=require('./member-state');
const {applyMemberStateUpdate}=require('./member-state-update');

function reviewDueAt(createdAt,reviewDays){
  if(!createdAt||!Number.isFinite(Number(reviewDays)))return null;
  const d=new Date(createdAt);
  if(Number.isNaN(d.getTime()))return null;
  d.setUTCDate(d.getUTCDate()+Number(reviewDays));
  return d.toISOString();
}

function canonicalPlanResultToUpdate(plan,{state=null,source='planning:canonical',at=plan?.createdAt||new Date().toISOString()}={}){
  if(!plan||!Number.isInteger(plan.memberStateRevision))throw new Error('canonical plan result with memberStateRevision is required');
  if(plan.status!=='active')throw new Error('only active canonical plan results may update activePlan');
  const active=Array.isArray(plan.active)?plan.active:[];
  if(!active.length)throw new Error('active canonical plan result requires interventions');

  if(state){
    assertMemberState(state);
    if(plan.memberStateRevision!==state.revision)throw new Error(`plan result revision conflict: expected ${plan.memberStateRevision}, actual ${state.revision}`);
    const accepted=new Set(state.priorities.filter(p=>p.status==='ACCEPTED').map(p=>p.id));
    for(const item of active){
      if(!accepted.has(item.priorityId))throw new Error(`plan intervention requires accepted priority: ${item.priorityId}`);
      const priority=state.priorities.find(p=>p.id===item.priorityId);
      if(!priority||priority.problemId!==item.problemId)throw new Error('plan intervention problem must match accepted priority');
      const problem=state.problems.find(p=>p.id===item.problemId);
      if(!problem||problem.status!=='SUPPORTED')throw new Error('plan intervention requires supported problem');
    }
  }

  return {
    type:'PLAN_UPDATED',source,at,expectedRevision:plan.memberStateRevision,
    reason:'canonical Planning result accepted for persistence',
    refs:active.flatMap(i=>i.evidenceRefs||[]),
    payload:{
      planId:state?`plan:${state.memberId}:${state.revision+1}`:`plan:r${plan.memberStateRevision}`,
      status:'ACTIVE',activatedAt:at,reviewDueAt:reviewDueAt(at,plan.reviewDays),
      interventions:active.map(i=>({
        id:i.intervention_id||i.id,priorityId:i.priorityId,problemId:i.problemId,status:'ACCEPTED',
        title:i.title||null,purpose:i.purpose||null,selectionMechanism:i.selectionMechanism||null,
        evidenceRefs:[...(i.evidenceRefs||[])],burden:{...(i.burden||{})},actionTemplates:[...(i.actionTemplates||[])],
        measurement:{...(i.measurement||{})},reviewRule:{...(i.reviewRule||{})},registryVersion:i.registry_version||plan.registry_version||null
      })),
      backlog:(plan.backlog||[]).map(i=>({id:i.intervention_id||i.id,priorityId:i.priorityId,problemId:i.problemId,status:'backlog'})),
      reviewDays:plan.reviewDays??null,activationStatus:plan.activationStatus||'ready',registryVersion:plan.registry_version||null,
      planningRevision:plan.memberStateRevision,decisionTrace:{...(plan.decisionTrace||{})}
    }
  };
}

function applyCanonicalPlanResult(state,plan,options={}){
  return applyMemberStateUpdate(state,canonicalPlanResultToUpdate(plan,{...options,state}));
}

module.exports={canonicalPlanResultToUpdate,applyCanonicalPlanResult};
