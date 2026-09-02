// Canonical active-Plan Review semantics.
// Review classifies post-activation evidence only; Adjust owns disposition and routing.
import {safetyGate} from '../safety/gate.js';
import {classifyReviewEvidence} from './review-sufficiency.js';
const freeze=x=>Object.freeze(x);const DEFAULT_DEEPEN_MAX_DAYS=14;
const daysSince=(iso,now)=>iso?Math.max(0,(Number(now)-new Date(iso).getTime())/86400000):0;
const activeActions=plan=>plan.activeActions||plan.actions||plan.active||[];
const actionId=action=>action.actionId||action.id||null;
const focusRefs=(plan,actions)=>[...(plan.focusIds||[]),...actions.flatMap(action=>action.focusIds||[])].filter(Boolean);
const activatedMeasurementContract=(actions,override)=>{if(override&&Object.keys(override).length)return override;if(actions.length===1)return actions[0].measurement||{};const required=[...new Set(actions.flatMap(a=>a.measurement?.requiredReviewSignals||[]))];return required.length?{requiredReviewSignals:required}:{};};
export function reviewPlan({plan={},evidence={},measurementContract=null,safetyContextualSignals={},safetyConfirmation=null,now=Date.now(),deepenMaxDays=DEFAULT_DEEPEN_MAX_DAYS}={}){
 const actions=activeActions(plan);if(plan.status!=='active'||!actions.length)throw new Error('Active canonical Plan with Actions required');
 const actionIds=actions.map(actionId).filter(Boolean);if(actionIds.length!==actions.length)throw new Error('Every active Action requires actionId');
 const safety=safetyGate({stage:'review',contextualSignals:safetyContextualSignals,confirmation:safetyConfirmation,evidenceRefs:evidence.evidenceRefs||[],concernRefs:focusRefs(plan,actions)});
 if(safety.pauseOrdinaryFlow)return freeze({contractVersion:'plan-review-v5',status:'SAFETY_INTERRUPTED',reason:safety.status,valid:true,safety,actionIds:freeze(actionIds),pauseOrdinaryFlow:true});
 const measurement=activatedMeasurementContract(actions,measurementContract);const classification=classifyReviewEvidence({evidence,measurementContract:measurement});
 const lastResponseAt=evidence.lastResponseAt||plan.lastMemberResponseAt||null,deepeningStartedAt=evidence.deepeningStartedAt||plan.deepeningStartedAt||null,nonResponse=Boolean(evidence.nonResponse)||(lastResponseAt&&daysSince(lastResponseAt,now)>=deepenMaxDays),deepeningExpired=deepeningStartedAt&&daysSince(deepeningStartedAt,now)>=deepenMaxDays;
 let status='CLASSIFIED',reason='review_evidence_classified',nextEvidenceRequest=null,memberPrompt=null;
 if(Boolean(evidence.circumstancesChanged)){status='CONTEXT_CHANGED';reason='member_context_changed'}
 else if(nonResponse){status='NON_RESPONSE';reason='member_non_response';memberPrompt='pause_or_reengage'}
 else if(!classification.sufficiency.sufficient&&deepeningExpired){status='EVIDENCE_TIMEBOX_EXPIRED';reason='deepening_timebox_expired';memberPrompt='reassess_or_pause'}
 else if(!classification.sufficiency.sufficient){status='EVIDENCE_INCOMPLETE';reason='review_evidence_incomplete';nextEvidenceRequest=classification.sufficiency.nextEvidenceRequest}
 return freeze({contractVersion:'plan-review-v5',status,reason,valid:true,safety,classification,measurementContract:freeze({...measurement}),evidenceUsed:freeze({...evidence}),actionIds:freeze(actionIds),nextEvidenceRequest,memberPrompt,deepening:freeze({maxDays:deepenMaxDays,expired:Boolean(deepeningExpired)}),pauseOrdinaryFlow:false});
}
export{DEFAULT_DEEPEN_MAX_DAYS};