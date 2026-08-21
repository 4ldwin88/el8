import assert from 'node:assert/strict';
import { scoreQuestion, selectQuestions } from './question-selector.js';

const q=(id,signal,overrides={})=>({
  id, signal, active:true, information_value:4, actionability:4, burden:1,
  eligibility_triggers:[signal], ...overrides
});

function ids(result){return result.selected.map(x=>x.question.id)}

// 1. High friction / low capacity: ordinary questioning collapses to <=1.
{
  const candidates=[q('sleep','sleep'),q('movement','movement'),q('food','food')];
  const result=selectQuestions(candidates,{activeTriggers:['sleep','movement','food'],uncertainSignals:['sleep','movement','food'],friction:1,capacity:.2});
  assert.ok(result.selected.length<=1,'high-friction member received too many questions');
}

// 2. Financial uncertainty: targeted financial question outranks unrelated questions.
{
  const candidates=[
    q('runway','financial_runway',{information_value:5,actionability:5}),
    q('sleep','sleep'),
    q('movement','movement')
  ];
  const result=selectQuestions(candidates,{activeTriggers:['financial_runway'],uncertainSignals:['financial_runway']});
  assert.equal(ids(result)[0],'runway');
}

// 3. Safety-relevant alone must NOT bypass trigger eligibility.
{
  const emotional=q('emotional-safety','emotional_state',{safety_relevant:true,safety_rules:{safety_relevant:true}});
  const scored=scoreQuestion(emotional,{activeTriggers:['financial_runway'],uncertainSignals:['financial_runway']});
  assert.equal(scored.eligible,false);
  assert.equal(scored.reason,'trigger');
}

// 4. Explicit safety override may bypass normal trigger and burden constraints.
{
  const safety=q('safety-followup','acute_safety',{burden:5,safety_rules:{safety_relevant:true,override_burden:true}});
  const result=selectQuestions([safety],{activeTriggers:[],safetyTriggered:true,friction:1,capacity:0,maxQuestions:0,maxBurden:0});
  assert.deepEqual(ids(result),['safety-followup']);
}

// 5. Stable / low-uncertainty member should receive no adaptive questions.
{
  const candidates=[q('sleep','sleep'),q('movement','movement')];
  const result=selectQuestions(candidates,{activeTriggers:['sleep','movement'],uncertaintyBySignal:{sleep:.05,movement:.05},evidenceAgeDays:{sleep:0,movement:0},friction:0,capacity:1});
  assert.equal(result.selected.length,0);
}

// 6. Stale evidence increases refresh priority.
{
  const candidates=[
    q('sleep-refresh','sleep',{stale_after_days:7}),
    q('movement-refresh','movement',{stale_after_days:7})
  ];
  const result=selectQuestions(candidates,{activeTriggers:['sleep','movement'],uncertaintyBySignal:{sleep:.7,movement:.7},evidenceAgeDays:{sleep:30,movement:1},maxQuestions:1});
  assert.deepEqual(ids(result),['sleep-refresh']);
}

// 7. Recently asked same question is suppressed by redundancy penalty.
{
  const candidates=[q('sleep-a','sleep'),q('movement-a','movement')];
  const result=selectQuestions(candidates,{activeTriggers:['sleep','movement'],uncertainSignals:['sleep','movement'],recentQuestionIds:['sleep-a'],maxQuestions:1});
  assert.deepEqual(ids(result),['movement-a']);
}

console.log('question-selector adversarial tests passed');
