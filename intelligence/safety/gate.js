// Cross-stage Safety authority. Ordinary intelligence may surface contextual indicators,
// but only canonical Safety can pause/escalate. A negative confirmation is not proof of safety.
import {evaluateContextualSafety,evaluateDirectConfirmation} from './policy.js';
export function safetyGate({stage='unknown',contextualSignals={},confirmation=null,observationRefs=[],evidenceRefs=[],concernRefs=[]}={}){
 const contextual=evaluateContextualSafety({signalId:`safety:${stage}`,sourceComponent:stage,contextualSignals,observationRefs,evidenceRefs,concernRefs});
 if(!contextual.needsDirectConfirmation)return{stage,status:'clear_for_ordinary_flow',pauseOrdinaryFlow:false,contextual,disposition:null};
 if(!confirmation)return{stage,status:'confirmation_required',pauseOrdinaryFlow:true,contextual,disposition:null};
 const disposition=evaluateDirectConfirmation({signalRefs:contextual.signals.map(x=>x.signalId),confirmation});
 const escalated=disposition.disposition==='escalate';
 return{stage,status:escalated?'escalate':'continue_with_constraints',pauseOrdinaryFlow:escalated,contextual,disposition,unresolvedContext:!escalated};
}
export function assertSafetyAllowsOrdinaryFlow(result){if(result?.pauseOrdinaryFlow)throw new Error(result.status==='confirmation_required'?'Safety clarification must be completed before ordinary recommendations continue.':'Safety disposition pauses ordinary recommendations.');return true}
