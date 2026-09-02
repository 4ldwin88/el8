// Adjust authority: consume structured Review state and choose the next governed disposition/route.
// Review classifies evidence; this module owns adaptation disposition and downstream routing.
import {REVIEW_ATTEMPT,REVIEW_OUTCOME} from './review-sufficiency.js';
const freeze=x=>Object.freeze(x);
const activeActions=plan=>plan.activeActions||plan.actions||plan.active||[];
const actionId=action=>action.actionId||action.id||null;
export const ADJUST_DISPOSITION=freeze({MAINTAIN:'MAINTAIN',SIMPLIFY:'SIMPLIFY',REPLACE:'REPLACE',PAUSE_REASSESS:'PAUSE_REASSESS',REFER_ESCALATE:'REFER_ESCALATE'});

export function selectAdjustment({review={},plan={}}={}){
 if(!review.valid)throw new Error('Valid Review state required');
 const actionIds=activeActions(plan).map(actionId).filter(Boolean);
 if(review.status==='SAFETY_INTERRUPTED')return freeze({disposition:ADJUST_DISPOSITION.REFER_ESCALATE,route:'safety',actionIds:freeze(actionIds),preservePlan:false,pausePlan:true,reason:review.reason});
 if(review.status==='NON_RESPONSE')return freeze({disposition:ADJUST_DISPOSITION.PAUSE_REASSESS,route:'pause-reengage',actionIds:freeze(actionIds),preservePlan:true,pausePlan:true,memberPrompt:'pause_or_reengage',reason:review.reason});
 if(review.status==='CONTEXT_CHANGED'||review.status==='EVIDENCE_TIMEBOX_EXPIRED')return freeze({disposition:ADJUST_DISPOSITION.PAUSE_REASSESS,route:'discovery',actionIds:freeze(actionIds),preservePlan:false,reason:review.reason});
 const c=review.classification||{};
 if(review.status==='EVIDENCE_INCOMPLETE'||!c.sufficiency?.sufficient||c.attempt===REVIEW_ATTEMPT.UNKNOWN||c.outcome===REVIEW_OUTCOME.INSUFFICIENT_EVIDENCE)return freeze({disposition:null,route:'review-deepening',actionIds:freeze(actionIds),preservePlan:true,nextEvidenceRequest:review.nextEvidenceRequest??c.sufficiency?.nextEvidenceRequest??null,reason:'review_evidence_incomplete'});
 if(c.attempt===REVIEW_ATTEMPT.ADEQUATE&&c.outcome===REVIEW_OUTCOME.IMPROVING&&c.burden!=='high')return freeze({disposition:ADJUST_DISPOSITION.MAINTAIN,route:'continue',actionIds:freeze(actionIds),preservePlan:true,reason:'working_and_sustainable'});
 if((c.burden==='high'||c.attempt===REVIEW_ATTEMPT.NOT_ADEQUATELY_ATTEMPTED)&&review.evidenceUsed?.barrierKnown&&c.outcome!==REVIEW_OUTCOME.WORSENING)return freeze({disposition:ADJUST_DISPOSITION.SIMPLIFY,route:'planning',actionIds:freeze(actionIds),rejectedActionIds:freeze([]),adaptationConstraint:'reduce_burden',preservePlan:false,reason:'execution_barrier_identified'});
 if(c.attempt===REVIEW_ATTEMPT.ADEQUATE&&(c.outcome===REVIEW_OUTCOME.NO_MEANINGFUL_CHANGE||c.outcome===REVIEW_OUTCOME.WORSENING))return freeze({disposition:ADJUST_DISPOSITION.REPLACE,route:'planning',actionIds:freeze(actionIds),rejectedActionIds:freeze(actionIds),adaptationConstraint:'different_action',preservePlan:false,reason:'executed_without_expected_benefit'});
 return freeze({disposition:null,route:'review-deepening',actionIds:freeze(actionIds),preservePlan:true,reason:'insufficient_decision_clarity'});
}
export function routeReview({review={},plan={}}={}){return selectAdjustment({review,plan});}
