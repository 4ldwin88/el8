// Canonical active-plan review semantics.
// Review interprets observed execution/outcomes; Safety pre-empts ordinary adaptation.
import {safetyGate} from '../safety/gate.js';
const freeze=x=>Object.freeze(x);const VALID=new Set(['keep','simplify','replace','deepen','reassess','disengaged']);const DEFAULT_DEEPEN_MAX_DAYS=14;
const daysSince=(iso,now)=>iso?Math.max(0,(Number(now)-new Date(iso).getTime())/86400000):0;
export function reviewPlan({plan={},evidence={},safetyContextualSignals={},safetyConfirmation=null,now=Date.now(),deepenMaxDays=DEFAULT_DEEPEN_MAX_DAYS}={}){
 if(plan.status!=='active'||!(plan.active||[]).length)throw new Error('Active plan required');
 const safety=safetyGate({stage:'review',contextualSignals:safetyContextualSignals,confirmation:safetyConfirmation,evidenceRefs:evidence.evidenceRefs||[],concernRefs:(plan.active||[]).map(x=>x.driver).filter(Boolean)});
 if(safety.pauseOrdinaryFlow)return freeze({contractVersion:'plan-review-v1',decision:'safety_hold',reason:safety.status,valid:true,safety,actionIds:freeze((plan.active||[]).map(x=>x.id)),requiresDiscovery:false,requiresPlanning:false,continueCurrent:false,pausePlan:true});
 const adherence=evidence.adherence??null,outcome=evidence.outcome??null,burden=evidence.burden??null,barrierKnown=Boolean(evidence.barrierKnown),circumstancesChanged=Boolean(evidence.circumstancesChanged),lastResponseAt=evidence.lastResponseAt||plan.lastMemberResponseAt||null,deepeningStartedAt=evidence.deepeningStartedAt||plan.deepeningStartedAt||null,nonResponse=Boolean(evidence.nonResponse)||(lastResponseAt&&daysSince(lastResponseAt,now)>=deepenMaxDays),deepeningExpired=deepeningStartedAt&&daysSince(deepeningStartedAt,now)>=deepenMaxDays;
 let decision,reason;
 if(circumstancesChanged){decision='reassess';reason='member_context_changed'}
 else if(nonResponse){decision='disengaged';reason='member_non_response'}
 else if((adherence===null||outcome===null)&&deepeningExpired){decision='reassess';reason='deepening_timebox_expired'}
 else if(adherence===null||outcome===null){decision='deepen';reason='review_evidence_incomplete'}
 else if(adherence==='high'&&outcome==='improved'&&burden!=='high'){decision='keep';reason='working_and_sustainable'}
 else if((burden==='high'||adherence==='low')&&outcome!=='worse'&&barrierKnown){decision='simplify';reason='execution_barrier_identified'}
 else if(adherence==='high'&&(outcome==='unchanged'||outcome==='worse')){decision='replace';reason='executed_without_expected_benefit'}
 else{decision='deepen';reason='insufficient_causal_clarity'}
 const disengaged=decision==='disengaged';return freeze({contractVersion:'plan-review-v1',decision,reason,valid:VALID.has(decision),safety,evidenceUsed:freeze({...evidence}),actionIds:freeze((plan.active||[]).map(x=>x.id)),requiresDiscovery:decision==='reassess',requiresPlanning:decision==='replace'||decision==='simplify',continueCurrent:decision==='keep'||decision==='deepen',pausePlan:disengaged,memberPrompt:disengaged?'pause_or_reengage':decision==='reassess'&&reason==='deepening_timebox_expired'?'reassess_or_pause':null,deepening:{maxDays:deepenMaxDays,expired:Boolean(deepeningExpired)}})}
export{DEFAULT_DEEPEN_MAX_DAYS};