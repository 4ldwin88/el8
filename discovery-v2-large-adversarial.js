import E from './discovery-v2-engine.js';

// Large-scale deterministic adversarial stress test for Gate A.
// This does not tune the engine. It probes the frozen implementation across
// randomized multi-signal, uncertainty, correction and healthy-member paths.
const RUNS = Number(process.env.EL8_STRESS_RUNS || 5000);
const SEED = Number(process.env.EL8_STRESS_SEED || 880819);
const drivers = ['work_instability','money_pressure','relationship_strain','low_support','home_instability','lack_direction','schedule_disruption','poor_sleep','stress','low_energy','low_focus'];
const presentations = {
  work_instability:'work', money_pressure:'money', relationship_strain:'relationships', low_support:'support',
  home_instability:'home', lack_direction:'direction', schedule_disruption:'schedule', poor_sleep:'sleep',
  stress:'stress', low_energy:'energy', low_focus:'focus'
};
const driverOption={work_instability:['work','stability','hard','yes'],money_pressure:['money','major','expenses','hard'],relationship_strain:['relationships','people','yes','conflict','hard'],low_support:['support','no','often','belonging'],home_instability:['home','yes','hard'],lack_direction:['direction','no','future','hard'],schedule_disruption:['schedule','little','often'],poor_sleep:['sleep','hard','schedule'],stress:['stress','hard','work'],low_energy:['energy','hard','sleep'],low_focus:['focus','hard','tired']};
const healthyByQuestion={D1:'unsure',D2:'both',D3:'unsure',D4:'one',D5:'nothing',W1:'well',W2:'no',W3:'none',W4:'no',SC1:'good',SC2:'no',M1:'well',M2:'no',M3:'unsure',M4:'no',R1:'well',R2:'no',R3:'none',S1:'yes',S2:'no',S3:'none',SL1:'well',SL2:'unsure',SL3:'no',E1:'well',E2:'unsure',ST1:'well',ST2:'internal',F1:'well',F2:'unsure',H1:'well',H2:'no',P1:'yes',P2:'well',B1:'separate',B2:'both',B3:'neither',B4:'no',C1:'earlier',C2:'no',HV1:'no',HV2:'yes',X1:'later'};
function rng(seed){let x=seed>>>0;return()=>{x=(1664525*x+1013904223)>>>0;return x/4294967296;};}
const R=rng(SEED); const pick=a=>a[Math.floor(R()*a.length)];
function optionExists(q,id){return id!=null&&q.options.some(o=>o.id===id);}
function choose(q,sc,step){
  if(q.role==='gateway'){
    const ids=q.options.filter(o=>sc.presentation.includes(o.id)).map(o=>o.id);
    if(ids.length) return ids;
    return q.options.some(o=>o.id==='other')?['other']:[];
  }
  if(sc.uncertainAt===step && optionExists(q,'unsure')) return 'unsure';
  // Only let a truth driver answer a question that actually targets that driver.
  // Without this guard, generic option ids such as "yes", "no" and "hard" can
  // leak across domains and manufacture contradictions in the stress harness.
  for(const t of sc.truth){
    if(!(q.targets||[]).includes(t)) continue;
    for(const oid of driverOption[t]||[]) if(optionExists(q,oid)) return oid;
  }
  if(sc.healthy && optionExists(q,healthyByQuestion[q.id])) return healthyByQuestion[q.id];
  return q.options.find(o=>['well','okay','no','nothing','none','good'].includes(o.id))?.id || q.options.find(o=>o.id==='unsure')?.id || q.options[0]?.id;
}
function makeCase(i){
  const healthy=R()<0.12;
  const count=healthy?0:(R()<0.18?3:R()<0.48?2:1);
  const truth=[]; while(truth.length<count){const d=pick(drivers);if(!truth.includes(d))truth.push(d);}
  let presentation=truth.map(d=>presentations[d]).filter(Boolean);
  if(!healthy && R()<0.22) presentation=[...presentation,'other'];
  if(healthy) presentation=[];
  const uncertainAt=R()<0.30?1+Math.floor(R()*5):-1;
  const correction=(!healthy&&truth.length>1&&R()<0.15)?truth[truth.length-1]:null;
  return {id:`stress-${i}`,healthy,truth,presentation:[...new Set(presentation)],uncertainAt,correction};
}
function run(sc){
  const s=E.session({});
  for(let i=0;i<8;i++){
    const q=E.next(s); if(!q) break;
    E.answer(s,q.id,choose(q,sc,i));
    if(sc.correction&&i===2) E.correct(s,sc.correction);
  }
  const tr=E.trace(s), ranks={}; tr.ranked.forEach((x,i)=>ranks[x.id]=i+1);
  const recovered=sc.truth.filter(x=>ranks[x]<=3);
  return {sc,tr,recovered};
}
const rows=Array.from({length:RUNS},(_,i)=>run(makeCase(i)));
const nonhealthy=rows.filter(r=>!r.sc.healthy), healthy=rows.filter(r=>r.sc.healthy), uncertain=rows.filter(r=>r.sc.uncertainAt>=0&&!r.sc.healthy), corrected=rows.filter(r=>r.sc.correction);
const multi=rows.filter(r=>r.sc.truth.length>=2);
const pct=(n,d)=>d?+(n/d).toFixed(4):1;
const metrics={
  runs:RUNS, seed:SEED,
  trueDriverAnyTop3:pct(nonhealthy.filter(r=>r.recovered.length>0).length,nonhealthy.length),
  multiDriverAnyTop3:pct(multi.filter(r=>r.recovered.length>0).length,multi.length),
  uncertaintyRecovery:pct(uncertain.filter(r=>r.recovered.length>0).length,uncertain.length),
  correctionSurvival:pct(corrected.filter(r=>r.recovered.length>0).length,corrected.length),
  healthyWithin3:pct(healthy.filter(r=>r.tr.asked.length<=3).length,healthy.length),
  budgetRate:pct(rows.filter(r=>r.tr.exitReason==='budget').length,rows.length),
  incoherentRate:pct(rows.filter(r=>r.tr.coherent===false).length,rows.length),
  avgQuestions:+(rows.reduce((a,r)=>a+r.tr.asked.length,0)/rows.length).toFixed(3)
};
// Conservative stress gates: large random suites are intentionally noisier than canonical QA.
const checks={
  trueDriverAnyTop3:metrics.trueDriverAnyTop3>=0.95,
  multiDriverAnyTop3:metrics.multiDriverAnyTop3>=0.95,
  uncertaintyRecovery:metrics.uncertaintyRecovery>=0.90,
  correctionSurvival:metrics.correctionSurvival>=0.90,
  healthyWithin3:metrics.healthyWithin3>=0.95,
  incoherentRate:metrics.incoherentRate===0
};
const failures=rows.filter(r=>(!r.sc.healthy&&r.recovered.length===0)||r.tr.coherent===false).slice(0,25).map(r=>({id:r.sc.id,truth:r.sc.truth,presentation:r.sc.presentation,uncertainAt:r.sc.uncertainAt,correction:r.sc.correction,asked:r.tr.asked,top3:r.tr.ranked.slice(0,3).map(x=>x.id),exitReason:r.tr.exitReason,coherent:r.tr.coherent}));
const out={metrics,checks,pass:Object.values(checks).every(Boolean),sampleFailures:failures};
console.log(JSON.stringify(out,null,2));
if(process.argv.includes('--enforce')&&!out.pass) process.exitCode=1;
