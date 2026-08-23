import C from './discovery-v2-7-contract.js';

const terminal=['resolved','linked','cleared','deferred'];
const results=[
 {id:'terminal_states_exact',pass:terminal.length===C.TERMINAL_SIGNAL_STATES.size&&terminal.every(x=>C.TERMINAL_SIGNAL_STATES.has(x))},
 {id:'question_ceiling_8',pass:C.MAX_QUESTIONS===8},
 {id:'evidence_precedence_exact',pass:JSON.stringify(C.EVIDENCE_PRECEDENCE)===JSON.stringify(['member-correction','current-direct','current-derived','warm-start'])},
 {id:'exit_reasons_exact',pass:['resolved','healthy','opt-out','budget'].every(x=>C.EXIT_REASONS.has(x))&&C.EXIT_REASONS.size===4},
 {id:'all_terminal_can_resolve',pass:C.canResolveDiscovery(terminal.map(status=>({status})))===true},
 {id:'open_blocks_resolution',pass:C.canResolveDiscovery([{status:'resolved'},{status:'open'}])===false},
 {id:'unknown_blocks_resolution',pass:C.canResolveDiscovery([{status:'resolved'},{status:'unknown'}])===false},
 {id:'null_signal_not_accounted',pass:C.isSignalAccounted(null)===false}
];
const failed=results.filter(x=>!x.pass);
console.log(JSON.stringify({suite:'Discovery v2.7 contract QA',results,passed:failed.length===0},null,2));
if(failed.length) process.exit(1);
