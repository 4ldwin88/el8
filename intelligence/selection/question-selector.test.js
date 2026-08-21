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
  const candidates=[q('runway','financial_runway',{information_value:5,actionability:5}),q('sleep','sleep'),q('movement','movement')];
  const result=selectQuestions(candidates,{activeTriggers:['financial_runway'],uncertainSignals:['financial_runway']});
  assert.equal(ids(result)[0],'runway');
}

// 3. Safety-relevant alone must NOT bypass trigger eligibility.
{
  const emotional=q('emotional-safety','emotional_state',{safety_relevant:true,safety_rules:{safety_relevant:true}});
  const scored=scoreQuestion(emotional,{activeTriggers:['financial_runway'],uncertainSignals:['financial_runway']});
  assert.equal(scored.eligible,false); assert.equal(scored.reason,'trigger');
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
  const candidates=[q('sleep-refresh','sleep',{stale_after_days:7}),q('movement-refresh','movement',{stale_after_days:7})];
  const result=selectQuestions(candidates,{activeTriggers:['sleep','movement'],uncertaintyBySignal:{sleep:.7,movement:.7},evidenceAgeDays:{sleep:30,movement:1},maxQuestions:1});
  assert.deepEqual(ids(result),['sleep-refresh']);
}

// 7. Recently asked same question is suppressed by redundancy penalty.
{
  const candidates=[q('sleep-a','sleep'),q('movement-a','movement')];
  const result=selectQuestions(candidates,{activeTriggers:['sleep','movement'],uncertainSignals:['sleep','movement'],recentQuestionIds:['sleep-a'],maxQuestions:1});
  assert.deepEqual(ids(result),['movement-a']);
}

// 8. Priority tie: ask a clarification question instead of arbitrarily choosing a dimension.
{
  const candidates=[
    q('physical-deepen','physical_detail',{eligibility_triggers:['physical_priority']}),
    q('emotional-deepen','emotional_detail',{eligibility_triggers:['emotional_priority']}),
    q('clarify-leverage','member_perceived_leverage',{information_value:5,actionability:5,eligibility_triggers:['priority_tie'],dependencies:['candidate_dimensions>=2']})
  ];
  const result=selectQuestions(candidates,{activeTriggers:['priority_tie','physical_priority','emotional_priority'],uncertaintyBySignal:{physical_detail:.6,emotional_detail:.6,member_perceived_leverage:1},candidateDimensions:['Physical','Emotional'],maxQuestions:1});
  assert.deepEqual(ids(result),['clarify-leverage']);
}

// 9. Clarification requiring multiple candidates is ineligible when there is only one candidate.
{
  const clarify=q('clarify','member_perceived_leverage',{eligibility_triggers:['priority_tie'],dependencies:['candidate_dimensions>=2']});
  const scored=scoreQuestion(clarify,{activeTriggers:['priority_tie'],candidateDimensions:['Physical']});
  assert.equal(scored.eligible,false); assert.equal(scored.reason,'dependencies');
}

// 10. Cross-dimensional evidence can outrank two narrow questions when it resolves a shared uncertainty.
{
  const candidates=[
    q('energy-cross','energy_interference',{information_value:5,actionability:5,primary_dimensions:['Physical','Emotional'],eligibility_triggers:['shared_interference_uncertain']}),
    q('physical-only','physical_detail',{eligibility_triggers:['physical_priority']}),
    q('emotional-only','emotional_detail',{eligibility_triggers:['emotional_priority']})
  ];
  const result=selectQuestions(candidates,{activeTriggers:['shared_interference_uncertain','physical_priority','emotional_priority'],uncertaintyBySignal:{energy_interference:1,physical_detail:.65,emotional_detail:.65},candidateDimensions:['Physical','Emotional'],maxQuestions:1});
  assert.deepEqual(ids(result),['energy-cross']);
}

// 11. Cross-dimensional questions do not get a free bonus merely for touching more dimensions.
{
  const candidates=[
    q('vague-cross','general_wellbeing',{primary_dimensions:['Physical','Emotional','Occupational'],eligibility_triggers:['general_wellbeing']}),
    q('specific','sleep_barrier',{information_value:5,actionability:5,eligibility_triggers:['sleep_barrier']})
  ];
  const result=selectQuestions(candidates,{activeTriggers:['general_wellbeing','sleep_barrier'],uncertaintyBySignal:{general_wellbeing:.45,sleep_barrier:1},maxQuestions:1});
  assert.deepEqual(ids(result),['specific']);
}

// 12. Conflicting dimensions with low uncertainty should still allow zero questions.
{
  const candidates=[q('clarify','member_perceived_leverage',{eligibility_triggers:['priority_tie'],dependencies:['candidate_dimensions>=2']})];
  const result=selectQuestions(candidates,{activeTriggers:['priority_tie'],candidateDimensions:['Physical','Emotional'],uncertaintyBySignal:{member_perceived_leverage:.05},friction:.2,capacity:.8});
  assert.equal(result.selected.length,0);
}

console.log('question-selector adversarial tests passed');
