import E from './discovery-v2-engine.js';
const m3=E.BANK.find(q=>q.id==='M3');
const s=E.session();E.answer(s,'G1',['money']);E.answer(s,'M3',['no_income','debt','expenses']);const t=E.trace(s),money=t.signals.find(x=>x.id==='money');
const evidence=(money?.driverEvidence||'').split(',');
const results=[
 {id:'m3_is_multiselect',pass:m3?.mode==='multi'},
 {id:'generic_several_removed',pass:!m3?.options.some(o=>o.id==='several')},
 {id:'all_sources_preserved',pass:['no_income','debt','expenses'].every(x=>evidence.includes(x))},
 {id:'employment_driver_activated',pass:(s.direct.work_instability||0)>=.2},
 {id:'money_pressure_activated',pass:(s.direct.money_pressure||0)>=.2},
 {id:'multi_driver_resolution',pass:money?.status==='resolved'&&money?.resolutionType==='multi-driver-sufficient'}
];
const failed=results.filter(x=>!x.pass);console.log(JSON.stringify({suite:'Discovery v2.6 finance multi-source regression',answer:s.answers.find(a=>a.qid==='M3'),signal:money,results,passed:!failed.length},null,2));if(failed.length)process.exit(1);
