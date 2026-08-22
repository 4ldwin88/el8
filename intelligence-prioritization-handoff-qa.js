import {handoff} from './intelligence-prioritization-handoff.js';

const trace=(ranked,signals=[],extra={})=>({ranked,signals,exitReason:'resolved',coherent:true,...extra});
const r=(id,score,direct=score,belief=score)=>({id,score,belief,direct});
const sig=(id,targets,status='resolved',refs=['G1','X1'])=>({id,targets,status,evidenceRefs:refs});

const CASES=[
 {id:'unemployment_drives_money',input:trace([r('money_pressure',1.28,1),r('work_instability',.95,.8),r('stress',.3,.1)],[sig('money',['money_pressure','work_instability'])]),expectTop:['money_pressure','work_instability']},
 {id:'health_and_finance_survive',input:trace([r('money_pressure',1.28,1),r('low_energy',1.1,.9),r('poor_sleep',.8,.7),r('stress',.25,.1)],[sig('money',['money_pressure']),sig('energy',['low_energy','poor_sleep'])]),expectContains:['money_pressure','low_energy']},
 {id:'secondary_not_starved',input:trace([r('money_pressure',1.3,1),r('relationship_strain',.72,.65),r('low_support',.55,.5)],[sig('money',['money_pressure']),sig('relationships',['relationship_strain','low_support'])]),expectContains:['money_pressure','relationship_strain']},
 {id:'deferred_is_flagged',input:trace([r('low_focus',.9,.7),r('work_instability',.7,.5)],[sig('focus',['low_focus'],'deferred'),sig('work',['work_instability'])],{exitReason:'budget'}),expectReview:true},
 {id:'incoherent_requires_review',input:trace([r('stress',.8,.6)],[],{coherent:false}),expectReview:true,expectReady:false},
 {id:'weak_noise_filtered',input:trace([r('stress',.12,.05),r('poor_sleep',.08,.02)]),expectCount:0,expectReady:false}
];

function run(c){const out=handoff(c.input);const ids=out.candidates.map(x=>x.id);let pass=true;
 if(c.expectTop) pass=pass&&c.expectTop.every((id,i)=>ids[i]===id);
 if(c.expectContains) pass=pass&&c.expectContains.every(id=>ids.includes(id));
 if(c.expectReview!==undefined) pass=pass&&out.requiresReview===c.expectReview;
 if(c.expectReady!==undefined) pass=pass&&out.readyForPrioritization===c.expectReady;
 if(c.expectCount!==undefined) pass=pass&&ids.length===c.expectCount;
 return{id:c.id,pass,ids,requiresReview:out.requiresReview,ready:out.readyForPrioritization};}
const results=CASES.map(run),failed=results.filter(x=>!x.pass);
console.log(JSON.stringify({suite:'Discovery -> Prioritization handoff v1',results,passed:failed.length===0},null,2));
if(failed.length)process.exit(1);
