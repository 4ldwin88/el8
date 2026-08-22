import {prioritize} from './intelligence-prioritization-engine-v1.js';
const c=(id,priorityScore,memberRaised=true)=>({id,priorityScore,memberRaised,discoveryDeferred:false,evidenceRefs:['G1']});
const h=candidates=>({readyForPrioritization:true,requiresReview:false,candidates});
const CASES=[
 {id:'actionable_beats_raw_strength',in:h([c('money_pressure',1.25),c('work_instability',.9)]),ctx:{impact:{money_pressure:.9,work_instability:.85},leverage:{money_pressure:.35,work_instability:.95},readiness:{money_pressure:.3,work_instability:.9},feasibility:{money_pressure:.3,work_instability:.9}},top:'work_instability'},
 {id:'cross_domain_leverage',in:h([c('poor_sleep',.9),c('low_energy',1.05)]),ctx:{leverage:{poor_sleep:1,low_energy:.35},impact:{poor_sleep:.9,low_energy:.8}},top:'poor_sleep'},
 {id:'member_preference_matters_not_dictates',in:h([c('money_pressure',1.2),c('low_focus',.75)]),ctx:{memberPreference:{money_pressure:.2,low_focus:1},impact:{money_pressure:1,low_focus:.6}},contains:'low_focus'},
 {id:'safety_override',in:h([c('money_pressure',1.3),c('stress',.55)]),ctx:{safety:{stress:.95}},top:'stress',reason:'safety-override'},
 {id:'deferred_not_primary',in:{readyForPrioritization:true,requiresReview:true,candidates:[{...c('low_focus',1.2),discoveryDeferred:true},c('work_instability',.75)]},ctx:{},top:'work_instability',review:true}
];
function run(x){const o=prioritize(x.in,x.ctx),ids=[...o.primary,...o.secondary].map(y=>y.id);let pass=o.primary[0]?.id===x.top;if(x.contains)pass=pass&&ids.includes(x.contains);if(x.reason)pass=pass&&o.reason===x.reason;if(x.review!==undefined)pass=pass&&o.requiresReview===x.review;return{id:x.id,pass,primary:o.primary.map(y=>y.id),secondary:o.secondary.map(y=>y.id),reason:o.reason};}
const results=CASES.map(run),failed=results.filter(x=>!x.pass);console.log(JSON.stringify({suite:'Prioritization Engine v1',results,passed:!failed.length},null,2));if(failed.length)process.exit(1);
