/* EL8 Discovery v2 — experimental graph + simulator foundation
 * Challenger architecture only. No production integration.
 * Discovery is intervention-agnostic and member-correctable.
 */

const EL8DiscoveryV2 = (() => {
  const NODES = [
    // experienced states
    { id:'low_energy', type:'state', label:'Low energy', dimensions:['physical'] },
    { id:'stress', type:'state', label:'Stress / emotional strain', dimensions:['emotional'] },
    { id:'poor_sleep', type:'state', label:'Poor or disrupted sleep', dimensions:['physical'] },
    { id:'lonely', type:'state', label:'Lonely / unsupported', dimensions:['social'] },
    { id:'low_focus', type:'state', label:'Low focus / motivation', dimensions:['intellectual','emotional'] },
    // drivers
    { id:'work_instability', type:'driver', label:'Work instability', dimensions:['occupational','financial'] },
    { id:'schedule_disruption', type:'driver', label:'Schedule disruption', dimensions:['occupational','physical'] },
    { id:'money_pressure', type:'driver', label:'Money pressure', dimensions:['financial'] },
    { id:'relationship_strain', type:'driver', label:'Relationship strain', dimensions:['social','emotional'] },
    { id:'low_support', type:'driver', label:'Low social support', dimensions:['social','emotional'] },
    { id:'home_instability', type:'driver', label:'Home / environmental instability', dimensions:['environmental'] },
    { id:'lack_direction', type:'driver', label:'Lack of direction / purpose', dimensions:['spiritual','occupational'] },
    // subdimensions
    { id:'employment_stability', type:'subdimension', label:'Employment stability', dimensions:['occupational'] },
    { id:'financial_security', type:'subdimension', label:'Financial security', dimensions:['financial'] },
    { id:'restorative_sleep', type:'subdimension', label:'Restorative sleep', dimensions:['physical'] },
    { id:'social_connection', type:'subdimension', label:'Social connection', dimensions:['social'] },
    { id:'stress_regulation', type:'subdimension', label:'Stress regulation', dimensions:['emotional'] },
    { id:'purpose_direction', type:'subdimension', label:'Purpose / direction', dimensions:['spiritual'] },
    { id:'environmental_stability', type:'subdimension', label:'Environmental stability', dimensions:['environmental'] }
  ];

  const EDGES = [
    ['work_instability','money_pressure','may-contribute-to',0.75],
    ['work_instability','stress','may-contribute-to',0.55],
    ['schedule_disruption','poor_sleep','may-contribute-to',0.8],
    ['poor_sleep','low_energy','may-contribute-to',0.75],
    ['poor_sleep','low_focus','may-contribute-to',0.55],
    ['money_pressure','stress','may-contribute-to',0.7],
    ['stress','poor_sleep','may-contribute-to',0.45],
    ['relationship_strain','stress','may-contribute-to',0.65],
    ['low_support','lonely','may-contribute-to',0.8],
    ['lonely','stress','may-contribute-to',0.4],
    ['home_instability','stress','may-contribute-to',0.55],
    ['lack_direction','low_focus','may-contribute-to',0.6],
    ['work_instability','employment_stability','maps-to',0.9],
    ['money_pressure','financial_security','maps-to',0.9],
    ['poor_sleep','restorative_sleep','maps-to',0.9],
    ['low_support','social_connection','maps-to',0.8],
    ['stress','stress_regulation','maps-to',0.75],
    ['lack_direction','purpose_direction','maps-to',0.9],
    ['home_instability','environmental_stability','maps-to',0.9]
  ].map(([from,to,type,weight])=>({from,to,type,weight}));

  const QUESTIONS = [
    {id:'gateway',role:'gateway',mode:'multi',burden:.35,text:'What’s been bothering you lately? Select any that fit.',options:[
      ['money','Money',{money_pressure:.7}],['work','Work or school',{work_instability:.55,schedule_disruption:.25}],['sleep','Sleep',{poor_sleep:.7}],['health','Health or energy',{low_energy:.6}],['stress','Stress or emotions',{stress:.65}],['relationships','Relationships',{relationship_strain:.65}],['support','Feeling lonely or unsupported',{low_support:.65,lonely:.5}],['home','Home or surroundings',{home_instability:.65}],['focus','Focus or motivation',{low_focus:.55,lack_direction:.2}],['direction','Direction or purpose',{lack_direction:.7}],['other','Something else',{}],['unsure','Not sure',{}]
    ]},
    {id:'stress_source',role:'discriminator',mode:'single',burden:.2,text:'What seems most connected to the stress?',targets:['stress'],options:[['work','Work',{work_instability:.65}],['money','Money',{money_pressure:.65}],['people','Relationships or people',{relationship_strain:.6,low_support:.25}],['general','It is there regardless of circumstances',{stress:.35}],['unsure','Not sure',{}]]},
    {id:'work_stability',role:'driver-probe',mode:'single',burden:.2,text:'How stable does work or school feel right now?',targets:['work_instability'],options:[['stable','Stable',{work_instability:-.75}],['some','Some uncertainty',{work_instability:.35}],['unstable','Very uncertain or unstable',{work_instability:.8}],['na','Not applicable',{work_instability:-.5}]]},
    {id:'schedule_control',role:'discriminator',mode:'single',burden:.2,text:'Is your schedule making sleep, meals, or routines harder to manage?',targets:['schedule_disruption','poor_sleep'],options:[['no','No',{schedule_disruption:-.65}],['some','A little',{schedule_disruption:.3}],['yes','Yes, noticeably',{schedule_disruption:.75,poor_sleep:.25}]]},
    {id:'money_effect',role:'driver-probe',mode:'single',burden:.2,text:'How much is money pressure affecting day-to-day decisions?',targets:['money_pressure'],options:[['none','Not really',{money_pressure:-.7}],['some','Somewhat',{money_pressure:.35}],['major','A lot',{money_pressure:.8}]]},
    {id:'relationship_effect',role:'driver-probe',mode:'single',burden:.2,text:'Are relationship problems taking up significant mental or emotional space?',targets:['relationship_strain'],options:[['no','No',{relationship_strain:-.65}],['some','Some',{relationship_strain:.3}],['yes','Yes',{relationship_strain:.75}]]},
    {id:'support_check',role:'driver-probe',mode:'single',burden:.18,text:'Do you have someone you can reliably turn to when you need support?',targets:['low_support'],options:[['yes','Yes',{low_support:-.7}],['sometimes','Sometimes',{low_support:.25}],['no','Not really',{low_support:.75}]]},
    {id:'sleep_cause',role:'discriminator',mode:'single',burden:.22,text:'What seems to interfere with sleep most?',targets:['poor_sleep'],options:[['schedule','Schedule or timing',{schedule_disruption:.65}],['stress','Stress or thoughts',{stress:.5}],['environment','Home or surroundings',{home_instability:.45}],['other','Something else',{poor_sleep:.2}],['unsure','Not sure',{}]]},
    {id:'direction_check',role:'driver-probe',mode:'single',burden:.2,text:'Do you feel clear about what you are working toward right now?',targets:['lack_direction'],options:[['yes','Yes',{lack_direction:-.7}],['partly','Partly',{lack_direction:.25}],['no','Not really',{lack_direction:.75}]]},
    {id:'home_check',role:'driver-probe',mode:'single',burden:.2,text:'Does your home or immediate environment make daily life harder?',targets:['home_instability'],options:[['no','No',{home_instability:-.7}],['sometimes','Sometimes',{home_instability:.3}],['yes','Yes',{home_instability:.75}]]},
    {id:'connected',role:'bridge',mode:'single',burden:.25,text:'Do these issues feel mostly separate, or does one seem to be causing the others?',options:[['separate','Mostly separate',{}],['connected','They seem connected',{}],['one','One seems to drive the others',{}],['unsure','Not sure',{}]]},
    {id:'healthy_verify',role:'healthy-verification',mode:'single',burden:.15,text:'Overall, is anything meaningfully getting in the way of daily life right now?',options:[['no','No',{stress:-.25,poor_sleep:-.25,low_energy:-.25}],['minor','Only minor things',{}],['yes','Yes',{}]]}
  ].map(q=>({...q,options:q.options.map(([id,label,effects])=>({id,label,effects}))}));

  const nodeById = Object.fromEntries(NODES.map(n=>[n.id,n]));
  const questionById = Object.fromEntries(QUESTIONS.map(q=>[q.id,q]));

  function newSession({warmStartEvidence={}}={}) {
    const beliefs={}; NODES.forEach(n=>beliefs[n.id]=0);
    Object.entries(warmStartEvidence).forEach(([id,v])=>{ if(id in beliefs) beliefs[id]=clamp(v*.35); });
    return {beliefs, asked:[], answers:[], corrections:[], optedOut:false, active:[], dormant:[], mode:Object.keys(warmStartEvidence).length?'warm':'cold'};
  }
  const clamp=v=>Math.max(-1,Math.min(1,v));

  function propagate(session, changedIds){
    // deliberately shallow propagation: prevents graph inertia from manufacturing certainty.
    for(const edge of EDGES){
      if(!changedIds.includes(edge.from) || edge.type==='maps-to') continue;
      const source=Math.max(0,session.beliefs[edge.from]);
      if(source>.2) session.beliefs[edge.to]=clamp(session.beliefs[edge.to]+source*edge.weight*.18);
    }
    for(const edge of EDGES){
      if(!changedIds.includes(edge.from) || edge.type!=='maps-to') continue;
      const source=session.beliefs[edge.from];
      session.beliefs[edge.to]=clamp(session.beliefs[edge.to]+source*edge.weight*.3);
    }
  }

  function answer(session, questionId, optionIds){
    const q=questionById[questionId]; if(!q) throw new Error('Unknown question');
    const ids=Array.isArray(optionIds)?optionIds:[optionIds];
    const changed=[];
    for(const id of ids){
      const opt=q.options.find(o=>o.id===id); if(!opt) continue;
      for(const [node,delta] of Object.entries(opt.effects||{})){
        session.beliefs[node]=clamp(session.beliefs[node]+delta); changed.push(node);
      }
    }
    if(!session.asked.includes(questionId)) session.asked.push(questionId);
    session.answers.push({questionId,optionIds:ids});
    propagate(session,[...new Set(changed)]); refreshWorkspace(session); return session;
  }

  function correct(session,nodeId,value=-.8){
    if(!(nodeId in session.beliefs)) return session;
    session.beliefs[nodeId]=clamp(value);
    session.corrections.push({nodeId,value});
    refreshWorkspace(session); return session;
  }

  function refreshWorkspace(session){
    const drivers=NODES.filter(n=>n.type==='driver').map(n=>({id:n.id,score:session.beliefs[n.id]})).sort((a,b)=>b.score-a.score);
    session.active=drivers.filter(x=>x.score>.12).slice(0,4).map(x=>x.id);
    session.dormant=drivers.filter(x=>x.score>.12).slice(4).map(x=>x.id);
  }

  function similarityPenalty(q,session){
    const recent=session.asked.slice(-2).map(id=>questionById[id]);
    if(recent.some(r=>r && r.role===q.role)) return .18;
    return 0;
  }

  function value(q,session){
    if(session.asked.includes(q.id)) return -Infinity;
    if(q.id==='gateway' && session.asked.length) return -Infinity;
    if(q.id==='healthy_verify' && session.active.length>1) return -.5;
    let discrimination=0;
    const targets=q.targets||[];
    for(const t of targets){ const b=session.beliefs[t]||0; discrimination += Math.max(0,.7-Math.abs(b)); }
    if(q.role==='bridge' && session.active.length>=2) discrimination+=.7;
    if(q.role==='healthy-verification' && session.active.length===0) discrimination+=.65;
    if(q.role==='gateway' && session.asked.length===0) discrimination+=session.mode==='cold'?1:.35;
    const novelty=.15*(1-similarityPenalty(q,session));
    return discrimination+novelty-(q.burden||.2)-similarityPenalty(q,session);
  }

  function nextQuestion(session){
    if(session.optedOut) return null;
    refreshWorkspace(session);
    if(shouldStop(session)) return null;
    return QUESTIONS.map(q=>({q,v:value(q,session)})).sort((a,b)=>b.v-a.v)[0]?.q||null;
  }

  function shouldStop(session){
    if(session.optedOut) return true;
    if(session.asked.length>=8) return true; // experimental hard guardrail, not target length
    const ranked=session.active.map(id=>session.beliefs[id]).sort((a,b)=>b-a);
    if(session.asked.length>=2 && ranked[0]>=.8 && (!ranked[1] || ranked[0]-ranked[1]>=.25)) return true;
    if(session.asked.length>=2 && session.active.length===0 && session.asked.includes('healthy_verify')) return true;
    return false;
  }

  function optOut(session){ session.optedOut=true; return session; }
  function rankedDrivers(session){ return NODES.filter(n=>n.type==='driver').map(n=>({id:n.id,label:n.label,score:+session.beliefs[n.id].toFixed(3)})).sort((a,b)=>b.score-a.score); }
  function trace(session){ return {mode:session.mode,asked:[...session.asked],active:[...session.active],dormant:[...session.dormant],drivers:rankedDrivers(session),corrections:[...session.corrections],stopped:shouldStop(session)}; }

  function runScenario(answerPlan,{warmStartEvidence={}}={}){
    const s=newSession({warmStartEvidence});
    for(let i=0;i<12;i++){
      const q=nextQuestion(s); if(!q) break;
      const planned=answerPlan[q.id];
      if(planned===undefined) break;
      if(planned==='__OPT_OUT__'){optOut(s);break;}
      answer(s,q.id,planned);
    }
    return trace(s);
  }

  return {NODES,EDGES,QUESTIONS,newSession,answer,correct,optOut,nextQuestion,shouldStop,rankedDrivers,trace,runScenario};
})();

if(typeof window!=='undefined') window.EL8DiscoveryV2=EL8DiscoveryV2;
if(typeof module!=='undefined') module.exports=EL8DiscoveryV2;
