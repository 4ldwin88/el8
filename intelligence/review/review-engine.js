// Canonical active-Plan Review semantics.
// Review interprets observed execution/outcomes; Safety pre-empts ordinary adaptation.
import {safetyGate} from '../safety/gate.js';
import {classifyReviewEvidence,REVIEW_ATTEMPT,REVIEW_OUTCOME} from './review-sufficiency.js';
const freeze=x=>Object.freeze(x);const VALID=new Set(['keep','simplify','replace','deepen','reassess','disengaged']);const DEFAULT_DEEPEN_MAX_DAYS=14;
const daysSince=(iso,now)=>iso?Math.max(0,(Number(now)-new Date(iso).getTime())/86400000):0;
const activeActions=plan=>plan.activeActions||plan.actions||plan.active||[];
const actionId=action=>action.actionId||action.id||null;
const focusRefs=(plan,actions)=>[...(plan.focusIds||[]),...actions.flatMap(action=>action.focusIds||[])].filter(Boolean);
const activatedMeasurementContract=(actions,override)=>{if(override&&Object.keys(override).length)return override;if(actions.length===1)return actions[0].measurement||{};const required=[...new Set(actions.flatMap(a=>a.measurement?.requiredReviewSignals||[]))];return required.length?{requiredReviewSignals:required}:{};};
export function reviewPlan({plan={},evidence={},measurementContract=null,safetyContextualSignals={},safetyConfirmation=null,now=Date.now(),deepenMaxDays=DEFAULT_DEEPEN_MAX_DAYS}={}){
 const actions=activeActions(plan);if(plan.status!=='active'||!actions.length)throw new Error('Active canonical Plan with Actions required');
 const actionIds=actions.map(actionId).filter(Boolean);if(actionIds.length!==actions.length)throw new Error('Every active Action requires actionId');
 const safety=safetyGate({stage:'review',contextualSignals:safetyContextualSignals,confirmation:safetyConfirmation,evidenceRefs:evidence.evidenceRefs||[],concernRefs:focusRefs(plan,actions)});
 if(safety.pauseOrdinaryFlow)return freeze({contractVersion:'plan-review-v4',decision:'safety_hold',reason:safety.status,valid:true,safety,actionIds:freeze(actionIds),requiresDiscovery:false,requiresPlanning:false,continueCurrent:false,pausePlan:true});
 const measurement=activatedMeasurementContract(actions,measurementContract);const classification=classifyReviewEvidence({evidence,measurementContract:measurement});
 const adherence=evidence.adherence??null,outcome=evidence.outcome??null,burden=evidence.burden??null,barrierKnown=Boolean(evidence.barrierKnown),circumstancesChanged=Boolean(evidence.circumstancesChanged),lastResponseAt=evidence.lastResponseAt||plan.lastMemberResponseAt||null,deepeningStartedAt=evidence.deepeningStartedAt||plan.deepeningStartedAt||null,nonResponse=Boolean(evidence.nonResponse)||(lastResponseAt&&daysSince(lastResponseAt,now)>=deepenMaxDays),deepeningExpired=deepeningStartedAt&&daysSince(deepeningStartedAt,now)>=deepenMaxDays;
 let decision,reason;
 if(circumstancesChanged){decision='reassess';reason='member_context_changed'}
 else if(nonResponse){decision='disengaged';reason='member_non_response'}
 else if(!classification.sufficiency.sufficient&&deepeningExpired){decision='reassess';reason='deepening_timebox_expired'}
 else if(!classification.sufficiency.sufficient||classification.attempt===REVIEW_ATTEMPT.UNKNOWN||classification.outcome===REVIEW_OUTCOME.INSUFFICIENT_EVIDENCE){decision='deepen';reason='review_evidence_incomplete'}
 else if(adherence==='high'&&outcome==='improved'&&burden!=='high'){decision='keep';reason='working_and_sustainable'}
 else if((burden==='high'||adherence==='low')&&outcome!=='worse'&&barrierKnown){decision='simplify';reason='execution_barrier_identified'}
 else if(adherence==='high'&&(outcome==='unchanged'||outcome==='worse')){decision='replace';reason='executed_without_expected_benefit'}
 else{decision='deepen';reason='insufficient_causal_clarity'}
 const disengaged=decision==='disengaged';return freeze({contractVersion:'plan-review-v4',decision,reason,valid:VALID.has(decision),safety,classification,measurementContract:freeze({...measurement}),evidenceUsed:freeze({...evidence}),actionIds:freeze(actionIds),requiresDiscovery:decision==='reassess',requiresPlanning:decision==='replace'||decision==='simplify',continueCurrent:decision==='keep'||decision==='deepen',pausePlan:disengaged,memberPrompt:disengaged?'pause_or_reengage':decision==='reassess'&&reason==='deepening_timebox_expired'?'reassess_or_pause':null,nextEvidenceRequest:decision==='deepen'?classification.sufficiency.nextEvidenceRequest:null,deepening:{maxDays:deepenMaxDays,expired:Boolean(deepeningExpired)}})}
export{DEFAULT_DEEPEN_MAX_DAYS};