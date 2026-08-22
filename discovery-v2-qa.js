/* EL8 Discovery v2 — adversarial QA harness.
 * Load after discovery-v2-simulator.js in browser, or run with Node.
 */
const D = typeof require==='function' ? require('./discovery-v2-simulator.js') : window.EL8DiscoveryV2;

const SCENARIOS = [
  {name:'Work instability presented as stress',truth:'work_instability',plan:{gateway:['stress','work'],stress_source:'work',work_stability:'unstable',schedule_control:'some',connected:'one'}},
  {name:'Financial pressure presented as poor sleep',truth:'money_pressure',plan:{gateway:['sleep','money'],sleep_cause:'stress',stress_source:'money',money_effect:'major',connected:'one'}},
  {name:'Social isolation presented as low energy',truth:'low_support',plan:{gateway:['health','support'],support_check:'no',connected:'one'}},
  {name:'Healthy member',truth:null,plan:{gateway:[],healthy_verify:'no'}},
  {name:'Repeated uncertainty',truth:null,plan:{gateway:['unsure'],healthy_verify:'minor'}},
  {name:'Many interacting factors',truth:'work_instability',plan:{gateway:['money','work','relationships','stress'],connected:'one',stress_source:'work',work_stability:'unstable',money_effect:'some',relationship_effect:'some'}},
  {name:'Schedule disruption upstream of sleep',truth:'schedule_disruption',plan:{gateway:['sleep','work'],sleep_cause:'schedule',schedule_control:'yes',work_stability:'stable'}},
  {name:'Direction issue presented as motivation',truth:'lack_direction',plan:{gateway:['focus','direction'],direction_check:'no'}},
  {name:'Home instability presented as stress',truth:'home_instability',plan:{gateway:['stress','home'],stress_source:'general',home_check:'yes'}},
  {name:'Warm start should not lock stale money hypothesis',truth:'relationship_strain',warm:{money_pressure:.8},plan:{gateway:['relationships'],relationship_effect:'yes',stress_source:'people'}}
];

function rankOf(trace,id){ if(!id) return null; const i=trace.drivers.findIndex(x=>x.id===id); return i<0?null:i+1; }
function overlap(a,b){ if(!a.length&&!b.length)return 1; const A=new Set(a),B=new Set(b); const intersection=[...A].filter(x=>B.has(x)).length; return intersection/new Set([...a,...b]).size; }

function runAll(){
  const results=SCENARIOS.map(s=>{
    const trace=D.runScenario(s.plan,{warmStartEvidence:s.warm||{}});
    return {scenario:s.name,truth:s.truth,rank:rankOf(trace,s.truth),questions:trace.asked.length,route:trace.asked.join(' > '),active:trace.active.join(', '),topDriver:trace.drivers[0]?.id||null,topScore:trace.drivers[0]?.score||0,trace};
  });
  const pairwise=[];
  for(let i=0;i<results.length;i++) for(let j=i+1;j<results.length;j++) pairwise.push(overlap(results[i].trace.asked,results[j].trace.asked));
  const truthRows=results.filter(r=>r.truth);
  const metrics={
    scenarios:results.length,
    trueDriverTop1Rate:+(truthRows.filter(r=>r.rank===1).length/Math.max(1,truthRows.length)).toFixed(3),
    trueDriverTop3Rate:+(truthRows.filter(r=>r.rank&&r.rank<=3).length/Math.max(1,truthRows.length)).toFixed(3),
    averageQuestions:+(results.reduce((a,r)=>a+r.questions,0)/results.length).toFixed(2),
    averageRouteOverlap:+(pairwise.reduce((a,v)=>a+v,0)/Math.max(1,pairwise.length)).toFixed(3),
    activeOverflowRate:+(results.filter(r=>r.trace.active.length>4).length/results.length).toFixed(3)
  };
  return {metrics,results};
}

function correctionTest(){
  const s=D.newSession();
  D.answer(s,'gateway',['money','work']);
  const before=D.trace(s);
  D.correct(s,'money_pressure',-.9);
  const after=D.trace(s);
  return {beforeMoney:before.drivers.find(x=>x.id==='money_pressure')?.score,afterMoney:after.drivers.find(x=>x.id==='money_pressure')?.score,activeAfter:after.active,pass:!after.active.includes('money_pressure')};
}

function answerSensitivityTest(){
  const a=D.newSession(),b=D.newSession();
  D.answer(a,'gateway',['stress','work']); D.answer(b,'gateway',['stress','relationships']);
  const qa=D.nextQuestion(a)?.id, qb=D.nextQuestion(b)?.id;
  return {routeA:qa,routeB:qb,pass:qa!==qb};
}

function report(){
  const suite=runAll(), correction=correctionTest(), sensitivity=answerSensitivityTest();
  const output={generatedAt:new Date().toISOString(),suite,correction,sensitivity};
  if(typeof console!=='undefined') console.table(suite.results.map(({trace,...r})=>r));
  if(typeof console!=='undefined') console.log('Discovery v2 metrics',suite.metrics,'Correction',correction,'Sensitivity',sensitivity);
  return output;
}

if(typeof window!=='undefined') window.EL8DiscoveryV2QA={SCENARIOS,runAll,correctionTest,answerSensitivityTest,report};
if(typeof module!=='undefined') module.exports={SCENARIOS,runAll,correctionTest,answerSensitivityTest,report};
