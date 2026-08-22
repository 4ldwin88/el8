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
  {name:'Warm start should not lock stale money hypothesis',truth:'relationship_strain',warm:{money_pressure:.8},plan:{gateway:['relationships'],relationship_effect:'yes',stress_source:'people'}},

  // Adversarial expansion: misleading gateways, contradictions, stale priors, ambiguity.
  {name:'Money selected but explicitly denied',truth:'work_instability',plan:{gateway:['money','work'],money_effect:'none',work_stability:'unstable',schedule_control:'no',connected:'one'}},
  {name:'Work selected but stable; schedule is actual driver',truth:'schedule_disruption',plan:{gateway:['work','sleep'],work_stability:'stable',schedule_control:'yes',sleep_cause:'schedule',connected:'one'}},
  {name:'Relationships selected but denied; support is actual driver',truth:'low_support',plan:{gateway:['relationships','support'],relationship_effect:'no',support_check:'no',connected:'one'}},
  {name:'Home selected but denied; money is actual driver',truth:'money_pressure',plan:{gateway:['home','money'],home_check:'no',money_effect:'major',connected:'one'}},
  {name:'Direction selected but clear; work instability remains',truth:'work_instability',plan:{gateway:['direction','work'],direction_check:'yes',work_stability:'unstable',schedule_control:'no'}},
  {name:'Stress source unsure with strong money evidence',truth:'money_pressure',plan:{gateway:['stress','money'],stress_source:'unsure',money_effect:'major',connected:'one'}},
  {name:'Sleep complaint caused by environment',truth:'home_instability',plan:{gateway:['sleep','home'],sleep_cause:'environment',home_check:'yes',connected:'one'}},
  {name:'Stale work prior contradicted by stable work',truth:'relationship_strain',warm:{work_instability:.9},plan:{gateway:['relationships','work'],work_stability:'stable',relationship_effect:'yes',stress_source:'people'}},
  {name:'Stale relationship prior contradicted by no relationship burden',truth:'lack_direction',warm:{relationship_strain:.9},plan:{gateway:['relationships','direction'],relationship_effect:'no',direction_check:'no'}},
  {name:'Broad noisy gateway resolves to home instability',truth:'home_instability',plan:{gateway:['money','work','stress','relationships','home'],connected:'one',stress_source:'general',money_effect:'none',work_stability:'stable',relationship_effect:'no',home_check:'yes'}},
  {name:'Broad noisy gateway resolves to relationship strain',truth:'relationship_strain',plan:{gateway:['money','work','relationships','support'],connected:'one',money_effect:'none',work_stability:'stable',relationship_effect:'yes',support_check:'yes'}},
  {name:'Unsure plus concrete direction signal',truth:'lack_direction',plan:{gateway:['unsure','direction'],direction_check:'no',healthy_verify:'yes'}},
  {name:'Other plus concrete support signal',truth:'low_support',plan:{gateway:['other','support'],support_check:'no',connected:'one'}},
  {name:'False schedule lead rejected; money remains',truth:'money_pressure',plan:{gateway:['sleep','money','work'],sleep_cause:'schedule',schedule_control:'no',work_stability:'stable',money_effect:'major',connected:'one'}},
  {name:'False stress relationship lead rejected; home remains',truth:'home_instability',plan:{gateway:['stress','relationships','home'],stress_source:'people',relationship_effect:'no',home_check:'yes',connected:'one'}}
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

function contradictionTests(){
  const tests=[];
  function test(name,setup,truth,rejected){
    const s=D.newSession(setup.warm?{warmStartEvidence:setup.warm}:{});
    for(const [q,a] of setup.answers) D.answer(s,q,a);
    const t=D.trace(s), truthRank=rankOf(t,truth), rejectedScore=t.drivers.find(x=>x.id===rejected)?.score??0;
    tests.push({name,truth,truthRank,rejected,rejectedScore,pass:truthRank!==null&&truthRank<=3&&rejectedScore<=.2});
  }
  test('Explicit money denial suppresses money hypothesis',{answers:[['gateway',['money','work']],['money_effect','none'],['work_stability','unstable']]},'work_instability','money_pressure');
  test('Stable work suppresses stale work prior',{warm:{work_instability:.9},answers:[['gateway',['work','relationships']],['work_stability','stable'],['relationship_effect','yes']]},'relationship_strain','work_instability');
  test('Relationship denial suppresses relationship hypothesis',{answers:[['gateway',['relationships','support']],['relationship_effect','no'],['support_check','no']]},'low_support','relationship_strain');
  test('Home denial suppresses home hypothesis',{answers:[['gateway',['home','money']],['home_check','no'],['money_effect','major']]},'money_pressure','home_instability');
  return {pass:tests.every(t=>t.pass),tests};
}

function releaseGates(output){
  const m=output.suite.metrics;
  const gates={
    top3:m.trueDriverTop3Rate>=.85,
    top1:m.trueDriverTop1Rate>=.60,
    burden:m.averageQuestions<=6,
    routeDiversity:m.averageRouteOverlap<=.40,
    workspace:m.activeOverflowRate<=.10,
    correction:output.correction.pass,
    sensitivity:output.sensitivity.pass,
    contradictions:output.contradictions.pass
  };
  return {pass:Object.values(gates).every(Boolean),gates};
}

function report(){
  const suite=runAll(), correction=correctionTest(), sensitivity=answerSensitivityTest(), contradictions=contradictionTests();
  const output={generatedAt:new Date().toISOString(),suite,correction,sensitivity,contradictions};
  output.release=releaseGates(output);
  if(typeof console!=='undefined') console.table(suite.results.map(({trace,...r})=>r));
  if(typeof console!=='undefined') console.log('Discovery v2 metrics',suite.metrics,'Correction',correction,'Sensitivity',sensitivity,'Contradictions',contradictions,'Release',output.release);
  return output;
}

if(typeof window!=='undefined') window.EL8DiscoveryV2QA={SCENARIOS,runAll,correctionTest,answerSensitivityTest,contradictionTests,releaseGates,report};
if(typeof module!=='undefined') module.exports={SCENARIOS,runAll,correctionTest,answerSensitivityTest,contradictionTests,releaseGates,report};
