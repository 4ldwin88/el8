import {reviewPlan} from '../review/review-engine.js';

export function projectCanonicalReview(state,evidence,{now=Date.now(),safetyContextualSignals={},safetyConfirmation=null}={}){
 if(!state||!Number.isInteger(state.revision))throw new Error('Member State required');
 const plan=state.activePlan;
 if(!plan||plan.status!=='ACTIVE'||!(plan.interventions||[]).length)throw new Error('canonical active plan required');
 const reviewPlanShape={status:'active',active:plan.interventions.map(i=>({id:i.id,driver:i.problemId,measurement:i.measurement,reviewRule:i.reviewRule,burden:i.burden})),lastMemberResponseAt:plan.lastMemberResponseAt||null,deepeningStartedAt:plan.deepeningStartedAt||null};
 const decision=reviewPlan({plan:reviewPlanShape,evidence,safetyContextualSignals,safetyConfirmation,now});
 return {memberStateRevision:state.revision,planId:plan.planId||null,interventionIds:plan.interventions.map(i=>i.id),measurementContracts:plan.interventions.map(i=>({interventionId:i.id,measurement:{...(i.measurement||{})},reviewRule:{...(i.reviewRule||{})}})),decision};
}

export function learningFromReview(review,{at=new Date().toISOString()}={}){
 if(!review||!review.decision)throw new Error('review result required');
 const d=review.decision;
 return review.interventionIds.map(interventionId=>({id:`learning:${interventionId}:${at}`,interventionId,planId:review.planId,learnedAt:at,outcome:d.evidenceUsed?.outcome??null,adherence:d.evidenceUsed?.adherence??null,burden:d.evidenceUsed?.burden??null,disposition:d.decision,reason:d.reason,evidenceRefs:[...(d.evidenceUsed?.evidenceRefs||[])],requiresDiscovery:Boolean(d.requiresDiscovery),requiresPlanning:Boolean(d.requiresPlanning)}));
}
