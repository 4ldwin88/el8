import E from './discovery-v2-engine.js';

// Regression from the first v2.4 human validation. The exact answer IDs below
// reproduce the material structure: money + sleep + health/energy are raised,
// PH0 identifies several health candidates, M3 identifies unemployment as the
// money driver, and an unrelated bridge must not permit premature closure.
const s=E.session();
E.answer(s,'G1',['money','sleep','energy']);
E.answer(s,'PH0',['energy','sleep','activity','body','motivation']);
E.answer(s,'M3','no_income');
E.answer(s,'B2','sleep');
const afterFour=E.trace(s);
const next=E.next(s);
const money=afterFour.signals.find(x=>x.id==='money');
const sleep=afterFour.signals.find(x=>x.id==='sleep');
const energy=afterFour.signals.find(x=>x.id==='energy');
const results=[
 {id:'does_not_stop_after_four',pass:afterFour.stopped===false},
 {id:'sleep_driver_not_falsely_known',pass:sleep?.driverKnown===false&&sleep?.status==='open'},
 {id:'energy_scope_not_driver_proof',pass:energy?.driverKnown===false&&energy?.status==='open'},
 {id:'unemployment_is_money_driver_evidence',pass:money?.driverKnown===true&&money?.driverEvidence==='no_income'&&(s.direct.work_instability||0)>=.2},
 {id:'next_question_discriminates_driver',pass:['E2','SL2'].includes(next?.id)},
 {id:'no_false_resolved_exit',pass:afterFour.exitReason!=='resolved'}
];
const failed=results.filter(x=>!x.pass);
console.log(JSON.stringify({suite:'Discovery v2.5 driver closure regression',asked:afterFour.asked,next:next?.id,signals:afterFour.signals,results,passed:!failed.length},null,2));
if(failed.length)process.exit(1);
