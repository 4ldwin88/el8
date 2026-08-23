import E from './discovery-v2-engine.js';

// Member Zero regression: repeated uncertainty must change question strategy.
// After two consecutive uncertain answers, Discovery must offer a concrete/
// observable question that does not itself offer "Not sure" before it may
// resolve. If that recovery question is answered and resolves the concern,
// no additional recovery question is required.
const hasUnsure=q=>q?.options?.some(o=>o.id==='unsure');
const answerUncertain=(s,q)=>{
  const unsure=q.options.find(o=>o.id==='unsure');
  if(unsure) return {state:E.answer(s,q.id,'unsure'),recovered:false};
  // A concrete question has been offered: the recovery requirement is met.
  return {state:E.answer(s,q.id,q.options[0]?.id),recovered:true,recoveryQuestion:q};
};

const s=E.session({});
const q1=E.next(s);
if(q1?.id!=='G1') throw new Error(`Expected G1 first, got ${q1?.id}`);
E.answer(s,'G1','unsure');
const q2=E.next(s);
let step=answerUncertain(s,q2);
let recovered=step.recovered;
let recoveryQuestion=step.recoveryQuestion||null;
const q3=E.next(s);
if(q3&&!recovered){
  step=answerUncertain(s,q3);
  recovered=step.recovered;
  recoveryQuestion=step.recoveryQuestion||recoveryQuestion;
}
const q4=E.next(s);

const result={
  asked:s.asked,
  uncertaintyStreak:s.uncertaintyStreak,
  recovered,
  recoveryQuestion:recoveryQuestion?.id||null,
  nextQuestion:q4?.id||null,
  nextText:q4?.text||null,
  nextHasUnsure:hasUnsure(q4),
  exitReason:s.exitReason
};
console.log(JSON.stringify(result,null,2));
if(!recovered){
  if(!q4) throw new Error('Persistent uncertainty ended Discovery before a recovery question was offered.');
  if(hasUnsure(q4)) throw new Error(`Persistent uncertainty did not switch to a concrete question; selected ${q4.id} still offers Not sure.`);
}
