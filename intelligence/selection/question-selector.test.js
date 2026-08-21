import assert from 'node:assert/strict';
import { scoreQuestion, selectQuestions, expectedInformationGain } from './question-selector.js';

const q=(id,signal,overrides={})=>({id,signal,active:true,information_value:4,actionability:4,burden:1,eligibility_triggers:[signal],...overrides});
function ids(result){return result.selected.map(x=>x.question.id)}

{
 const candidates=[q('sleep','sleep'),q('movement','movement'),q('food','food')];
 const result=selectQuestions(candidates,{activeTriggers:['sleep','movement','food'],uncertainSignals:['sleep','movement','food'],friction:1,capacity:.2});
 assert.ok(result.selected.length<=1);
}
{
 const candidates=[q('runway','financial_runway',{information_value:5,actionability:5}),q('sleep','sleep'),q('movement','movement')];
 assert.equal(ids(selectQuestions(candidates,{activeTriggers:['financial_runway'],uncertainSignals:['financial_runway']}))[0],'runway');
}
{
 const emotional=q('emotional-safety','emotional_state',{safety_relevant:true,safety_rules:{safety_relevant:true}});
 const scored=scoreQuestion(emotional,{activeTriggers:['financial_runway'],uncertainSignals:['financial_runway']});
 assert.equal(scored.eligible,false);assert.equal(scored.reason,'trigger');
}
{
 const safety=q('safety-followup','acute_safety',{burden:5,safety_rules:{safety_relevant:true,override_burden:true}});
 assert.deepEqual(ids(selectQuestions([safety],{activeTriggers:[],safetyTriggered:true,friction:1,capacity:0,maxQuestions:0,maxBurden:0})),['safety-followup']);
}
{
 const candidates=[q('sleep','sleep'),q('movement','movement')];
 assert.equal(selectQuestions(candidates,{activeTriggers:['sleep','movement'],uncertaintyBySignal:{sleep:.05,movement:.05},evidenceAgeDays:{sleep:0,movement:0},friction:0,capacity:1}).selected.length,0);
}
{
 const candidates=[q('sleep-refresh','sleep',{stale_after_days:7}),q('movement-refresh','movement',{stale_after_days:7})];
 assert.deepEqual(ids(selectQuestions(candidates,{activeTriggers:['sleep','movement'],uncertaintyBySignal:{sleep:.7,movement:.7},evidenceAgeDays:{sleep:30,movement:1},maxQuestions:1})),['sleep-refresh']);
}
{
 const candidates=[q('sleep-a','sleep'),q('movement-a','movement')];
 assert.deepEqual(ids(selectQuestions(candidates,{activeTriggers:['sleep','movement'],uncertainSignals:['sleep','movement'],recentQuestionIds:['sleep-a'],maxQuestions:1})),['movement-a']);
}
{
 const candidates=[q('physical-deepen','physical_detail',{eligibility_triggers:['physical_priority']}),q('emotional-deepen','emotional_detail',{eligibility_triggers:['emotional_priority']}),q('clarify-leverage','member_perceived_leverage',{information_value:5,actionability:5,eligibility_triggers:['priority_tie'],dependencies:['candidate_dimensions>=2']})];
 assert.deepEqual(ids(selectQuestions(candidates,{activeTriggers:['priority_tie','physical_priority','emotional_priority'],uncertaintyBySignal:{physical_detail:.6,emotional_detail:.6,member_perceived_leverage:1},candidateDimensions:['Physical','Emotional'],maxQuestions:1})),['clarify-leverage']);
}
{
 const clarify=q('clarify','member_perceived_leverage',{eligibility_triggers:['priority_tie'],dependencies:['candidate_dimensions>=2']});
 const scored=scoreQuestion(clarify,{activeTriggers:['priority_tie'],candidateDimensions:['Physical']});assert.equal(scored.eligible,false);assert.equal(scored.reason,'dependencies');
}
{
 const candidates=[q('energy-cross','energy_interference',{information_value:5,actionability:5,primary_dimensions:['Physical','Emotional'],eligibility_triggers:['shared_interference_uncertain']}),q('physical-only','physical_detail',{eligibility_triggers:['physical_priority']}),q('emotional-only','emotional_detail',{eligibility_triggers:['emotional_priority']})];
 assert.deepEqual(ids(selectQuestions(candidates,{activeTriggers:['shared_interference_uncertain','physical_priority','emotional_priority'],uncertaintyBySignal:{energy_interference:1,physical_detail:.65,emotional_detail:.65},candidateDimensions:['Physical','Emotional'],maxQuestions:1})),['energy-cross']);
}
{
 const candidates=[q('vague-cross','general_wellbeing',{primary_dimensions:['Physical','Emotional','Occupational'],eligibility_triggers:['general_wellbeing']}),q('specific','sleep_barrier',{information_value:5,actionability:5,eligibility_triggers:['sleep_barrier']})];
 assert.deepEqual(ids(selectQuestions(candidates,{activeTriggers:['general_wellbeing','sleep_barrier'],uncertaintyBySignal:{general_wellbeing:.45,sleep_barrier:1},maxQuestions:1})),['specific']);
}
{
 const candidates=[q('clarify','member_perceived_leverage',{eligibility_triggers:['priority_tie'],dependencies:['candidate_dimensions>=2']})];
 assert.equal(selectQuestions(candidates,{activeTriggers:['priority_tie'],candidateDimensions:['Physical','Emotional'],uncertaintyBySignal:{member_perceived_leverage:.05},friction:.2,capacity:.8}).selected.length,0);
}

// 13. EIG distinguishes two otherwise identical questions.
{
 const low=q('low-eig','shared',{options:['A','B'],answer_evidence:{A:[{uncertainty_reduction:.2}],B:[{uncertainty_reduction:.2}]}});
 const high=q('high-eig','shared',{options:['A','B'],answer_evidence:{A:[{uncertainty_reduction:.9}],B:[{uncertainty_reduction:.8}]}});
 assert.ok(expectedInformationGain(high)>expectedInformationGain(low));
 assert.deepEqual(ids(selectQuestions([low,high],{activeTriggers:['shared'],uncertaintyBySignal:{shared:1},maxQuestions:1})),['high-eig']);
}

// 14. Learned answer probabilities refine EIG instead of assuming every answer is equally likely.
{
 const question=q('probability-sensitive','signal',{options:['informative','weak'],answer_evidence:{informative:[{uncertainty_reduction:1}],weak:[{uncertainty_reduction:.1}]}});
 const uniform=expectedInformationGain(question,{});
 const learned=expectedInformationGain(question,{answerProbabilities:{'probability-sensitive':{informative:.9,weak:.1}}});
 assert.ok(learned>uniform);
}

// 15. Broad multi-effect answers are capped: cross-dimensional breadth alone cannot inflate EIG beyond 1.
{
 const question=q('broad','shared',{options:['A'],answer_evidence:{A:[{uncertainty_reduction:.8},{uncertainty_reduction:.8},{uncertainty_reduction:.8}]}});
 assert.equal(expectedInformationGain(question),1);
}

console.log('question-selector adversarial tests passed');
