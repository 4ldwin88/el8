import {decide} from './intelligence-decision-engine-v1.js';
const p=(id,extra={})=>({id,readiness:.6,feasibility:.6,...extra});
const wrap=primary=>({primary:primary?[primary]:[],secondary:[],queued:[],requiresReview:false});
const CASES=[
 {id:'ready_action',p:wrap(p('work_instability',{readiness:.8,feasibility:.8})),ctx:{},type:'action'},
 {id:'uncertain_assess_first',p:wrap(p('money_pressure')),ctx:{uncertainty:{money_pressure:.8}},type:'deeper-assessment'},
 {id:'low_readiness_observe',p:wrap(p('low_activity',{readiness:.2})),ctx:{trackability:{low_activity:.9}},type:'tracking'},
 {id:'knowledge_gap_content',p:wrap(p('poor_sleep',{readiness:.5})),ctx:{knowledgeGap:{poor_sleep:.8}},type:'content'},
 {id:'not_actionable_track',p:wrap(p('money_pressure',{feasibility:.2})),ctx:{},type:'tracking'},
 {id:'reassessment_due',p:wrap(p('stress')),ctx:{reassessmentDue:{stress:true}},type:'reassessment'},
 {id:'deferred_returns_assessment',p:wrap(p('low_focus',{discoveryDeferred:true})),ctx:{},type:'deeper-assessment'},
 {id:'nothing_material',p:wrap(null),ctx:{},type:'no-action'},
 {id:'safety_confirmation_interrupts',p:{...wrap(p('money_pressure')),safetyOverride:true},ctx:{safetyState:{needsDirectConfirmation:true,confirmed:false}},type:'safety-confirmation'},
 {id:'acute_safety_interrupts',p:{...wrap(p('money_pressure')),safetyOverride:true},ctx:{safetyState:{acuteRiskEstablished:true,escalate:true}},type:'safety-escalation'}
];
const results=CASES.map(c=>{const o=decide(c.p,c.ctx);return{id:c.id,pass:o.decision.type===c.type,got:o.decision.type,reason:o.decision.reason};});
const failed=results.filter(x=>!x.pass);console.log(JSON.stringify({suite:'Decision Engine v1',results,passed:!failed.length},null,2));if(failed.length)process.exit(1);
