// EL8 Discovery v2.7 executable contract constants.
// Keep these values aligned with discovery-v2-7-stage-contract.md and the synthetic release gates.
const TERMINAL_SIGNAL_STATES=new Set(['resolved','linked','cleared','deferred']);
const MAX_QUESTIONS=8;
const EVIDENCE_PRECEDENCE=['member-correction','current-direct','current-derived','warm-start'];
const EXIT_REASONS=new Set(['resolved','healthy','opt-out','budget']);
function isSignalAccounted(signal){return !!signal&&TERMINAL_SIGNAL_STATES.has(signal.status);}
function canResolveDiscovery(signals=[]){return signals.every(isSignalAccounted);}
export {TERMINAL_SIGNAL_STATES,MAX_QUESTIONS,EVIDENCE_PRECEDENCE,EXIT_REASONS,isSignalAccounted,canResolveDiscovery};
export default {TERMINAL_SIGNAL_STATES,MAX_QUESTIONS,EVIDENCE_PRECEDENCE,EXIT_REASONS,isSignalAccounted,canResolveDiscovery};
