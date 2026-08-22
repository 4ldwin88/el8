import {runIntelligence} from './intelligence-pipeline-v1.js';
const r=(id,score,direct=score)=>({id,score,belief:score,direct});
const s=(id,targets,status='resolved')=>({id,targets,status,evidenceRefs:['G1','X1']});
const t=(ranked,signals,extra={})=>({ranked,signals,exitReason:'resolved',coherent:true,...extra});
const CASES=[
 {id:'unemployment_money_action',trace:t([r('money_pressure',1.28,1),r('work_instability',1.05,.9)],[s('money',['money_pressure','work_instability'])]),ctx:{leverage:{work_instability:1,money_pressure:.25},readiness:{work_instability:.85,money_pressure:.4},feasibility:{work_instability:.9,money_pressure:.3}},primary:'work_instability',outcome:'action'},
 {id:'health_measure_before_pressure',trace:t([r('low_energy',1.1,.9),r('poor_sleep',.85,.7)],[s('energy',['low_energy','poor_sleep'])]),ctx:{readiness:{low_energy:.45},trackability:{low_energy:.9}},outcome:'tracking'},
 {id:'uncertain_money_assess',trace:t([r('money_pressure',.9,.6)],[s('money',['money_pressure'])]),ctx:{uncertainty:{money_pressure:.8}},outcome:'deeper-assessment'},
 {id:'knowledge_before_action',trace:t([r('poor_sleep',1,.8)],[s('sleep',['poor_sleep'])]),ctx:{knowledgeGap:{poor_sleep:.9}},outcome:'content'},
 {id:'safety_interrupts_everything',trace:t([r('money_pressure',1.3,1)],[s('money',['money_pressure'])]),ctx:{safetyState:{acuteRiskEstablished:true,escalate:true}},outcome:'safety-escalation'},
 {id:'weak_evidence_no_action',trace:t([r('stress',.1,.05)],[]),ctx:{},outcome:'no-action'},
 {id:'deferred_requires_more_evidence',trace:t([r('low_focus',1,.8)],[s('focus',['low_focus'],'deferred')],{exitReason:'budget'}),ctx:{},outcome:'deeper-assessment'}
];
function run(c){const o=runIntelligence(c.trace,c.ctx);const got=o.decision.decision.type;let pass=got===c.outcome;if(c.primary)pass=pass&&o.prioritization.primary[0]?.id===c.primary;return{id:c.id,pass,primary:o.prioritization.primary[0]?.id||null,outcome:got,reason:o.decision.decision.reason};}
const results=CASES.map(run),failed=results.filter(x=>!x.pass);console.log(JSON.stringify({suite:'EL8 Intelligence Pipeline v1',results,passed:!failed.length},null,2));if(failed.length)process.exit(1);
