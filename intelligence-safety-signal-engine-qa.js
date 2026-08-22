import {assess,confirm} from './intelligence-safety-signal-engine-v1.js';
const CASES=[
 {id:'ordinary_bad_day',signals:{manageability:.45,overwhelm:.4,connection:.2},confirm:false},
 {id:'isolated_low_connection',signals:{connection:.95,manageability:.15,overwhelm:.15},confirm:false},
 {id:'converging_distress',signals:{manageability:.8,overwhelm:.78,connection:.7},confirm:true},
 {id:'loss_of_decision_trust_plus_impulsivity',signals:{decisionTrust:.82,impulsivity:.8,manageability:.7},confirm:true},
 {id:'explicit_signal_always_confirms',signals:{explicitSafetyConcern:true,manageability:.1},confirm:true}
];
function run(c){const out=assess(c.signals);return{id:c.id,pass:out.needsDirectConfirmation===c.confirm,score:out.score,confirmation:out.needsDirectConfirmation};}
const contextual=CASES.map(run);
const negative=confirm(assess({manageability:.85,overwhelm:.8}),{immediateDanger:false,intent:false,canStaySafe:true});
const positive=confirm(assess({manageability:.85,overwhelm:.8}),{immediateDanger:false,intent:false,canStaySafe:false});
const boundary=[
 {id:'contextual_not_acute',pass:assess({manageability:.95,overwhelm:.95}).acuteRiskEstablished===false},
 {id:'negative_confirmation_no_escalation',pass:negative.escalate===false&&negative.acuteRiskEstablished===false},
 {id:'positive_confirmation_escalates',pass:positive.escalate===true&&positive.acuteRiskEstablished===true}
];
const results=[...contextual,...boundary],failed=results.filter(x=>!x.pass);
console.log(JSON.stringify({suite:'Safety Signal Engine v1',results,passed:!failed.length},null,2));if(failed.length)process.exit(1);
