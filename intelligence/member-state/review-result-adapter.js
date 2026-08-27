'use strict';
const {applyMemberStateUpdate}=require('./member-state-update');

function applyReviewResult(state,review,{at,source='review.canonical'}={}){
 if(!review||review.memberStateRevision!==state.revision)throw new Error(`review result revision conflict: expected ${review?.memberStateRevision}, actual ${state.revision}`);
 const d=review.decision;if(!d||!d.decision)throw new Error('review decision required');
 let next=state;
 for(const interventionId of review.interventionIds||[]){
  next=applyMemberStateUpdate(next,{type:'LEARNING_RECORDED',at,source,expectedRevision:next.revision,reason:d.reason,refs:[...(d.evidenceUsed?.evidenceRefs||[])],payload:{id:`learning:${interventionId}:${at}`,interventionId,planId:review.planId||next.activePlan.planId||null,learnedAt:at,outcome:d.evidenceUsed?.outcome??null,adherence:d.evidenceUsed?.adherence??null,burden:d.evidenceUsed?.burden??null,disposition:d.decision,reason:d.reason,evidenceRefs:[...(d.evidenceUsed?.evidenceRefs||[])],requiresDiscovery:Boolean(d.requiresDiscovery),requiresPlanning:Boolean(d.requiresPlanning)}});
 }
 const route={decision:d.decision,requiresDiscovery:Boolean(d.requiresDiscovery),requiresPlanning:Boolean(d.requiresPlanning),continueCurrent:Boolean(d.continueCurrent),pausePlan:Boolean(d.pausePlan)};
 if(d.decision==='keep'||d.decision==='deepen'){
  next=applyMemberStateUpdate(next,{type:'PLAN_UPDATED',at,source,expectedRevision:next.revision,reason:d.reason,refs:[],payload:{reviewDisposition:d.decision,reviewedAt:at,status:d.decision==='keep'?'ACTIVE':'REVIEW_DEEPENING'}});
 }else if(d.decision==='simplify'||d.decision==='replace'){
  next=applyMemberStateUpdate(next,{type:'PLAN_UPDATED',at,source,expectedRevision:next.revision,reason:d.reason,refs:[],payload:{reviewDisposition:d.decision,reviewedAt:at,status:'REPLAN_REQUIRED',adaptationRequest:{constraint:d.decision==='simplify'?'reduce_burden':'different_intervention',reason:d.reason}}});
 }else if(d.decision==='reassess'){
  next=applyMemberStateUpdate(next,{type:'PLAN_UPDATED',at,source,expectedRevision:next.revision,reason:d.reason,refs:[],payload:{reviewDisposition:d.decision,reviewedAt:at,status:'REASSESS_REQUIRED'}});
 }else if(d.decision==='disengaged'||d.decision==='safety_hold'){
  next=applyMemberStateUpdate(next,{type:'PLAN_UPDATED',at,source,expectedRevision:next.revision,reason:d.reason,refs:[],payload:{reviewDisposition:d.decision,reviewedAt:at,status:'PAUSED'}});
 }else throw new Error(`unsupported review disposition: ${d.decision}`);
 return {state:next,route};
}
module.exports={applyReviewResult};
