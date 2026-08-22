import {prioritize} from './intelligence-prioritization-engine-v1.js';
import {assess,confirm} from './intelligence-safety-signal-engine-v1.js';
const handoff={readyForPrioritization:true,requiresReview:false,candidates:[{id:'money_pressure',priorityScore:1.25,memberRaised:true,discoveryDeferred:false,evidenceRefs:['G1','M3']},{id:'low_energy',priorityScore:.85,memberRaised:true,discoveryDeferred:false,evidenceRefs:['G1','PH0']}]};
const ordinary=prioritize(handoff,{safetyState:assess({manageability:.2,overwhelm:.2})});
const pendingState=assess({manageability:.85,overwhelm:.82,connection:.7});
const pending=prioritize(handoff,{safetyState:pendingState});
const cleared=prioritize(handoff,{safetyState:confirm(pendingState,{immediateDanger:false,intent:false,canStaySafe:true})});
const acute=prioritize(handoff,{safetyState:confirm(pendingState,{immediateDanger:false,intent:false,canStaySafe:false})});
const results=[
 {id:'ordinary_allows_prioritization',pass:ordinary.reason==='multi-factor-priority'&&ordinary.primary.length===1},
 {id:'contextual_threshold_pauses_priority',pass:pending.reason==='safety-confirmation-required'&&pending.deliveryMode==='safety-confirmation'},
 {id:'negative_confirmation_returns_to_priority',pass:cleared.reason==='multi-factor-priority'&&cleared.safetyOverride===false},
 {id:'confirmed_acute_bypasses_priority',pass:acute.reason==='confirmed-safety-override'&&acute.deliveryMode==='safety-escalation'&&acute.primary.length===0}
];
const failed=results.filter(x=>!x.pass);console.log(JSON.stringify({suite:'Prioritization + Safety integration',results,passed:!failed.length},null,2));if(failed.length)process.exit(1);
