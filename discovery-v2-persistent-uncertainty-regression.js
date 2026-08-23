import E from './discovery-v2-engine.js';

// Member Zero regression: repeated uncertainty must change question strategy.
// After two consecutive uncertain answers, the next selected question should
// prefer concrete/observable questions that do not themselves offer "Not sure"
// when an eligible alternative exists.
const hasUnsure=q=>q?.options?.some(o=>o.id==='unsure');
const answerUncertain=(s,q)=>{
  const unsure=q.options.find(o=>o.id==='unsure');
  if(unsure) return E.answer(s,q.id,'unsure');
  // If the engine already recovered to a concrete question, answer the first
  // valid observable option; the regression has achieved its purpose.
  return E.answer(s,q.id,q.options[0]?.id);
};

const s=E.session({});
const q1=E.next(s);
if(q1?.id!=='G1') throw new Error(`Expected G1 first, got ${q1?.id}`);
E.answer(s,'G1','unsure');
const q2=E.next(s);
answerUncertain(s,q2);
const q3=E.next(s);
answerUncertain(s,q3);
const q4=E.next(s);

const result={
  asked:s.asked,
  uncertaintyStreak:s.uncertaintyStreak,
  nextQuestion:q4?.id||null,
  nextText:q4?.text||null,
  nextHasUnsure:hasUnsure(q4),
  exitReason:s.exitReason
};
console.log(JSON.stringify(result,null,2));
if(!q4) throw new Error('Persistent uncertainty ended Discovery before a recovery question was offered.');
if(hasUnsure(q4)) throw new Error(`Persistent uncertainty did not switch to a concrete question; selected ${q4.id} still offers Not sure.`);
