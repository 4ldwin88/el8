import assert from 'node:assert/strict';
import { ACTIONS } from './index.js';
import { ALL_QUESTIONS, ALL_ANSWERS, ALL_EFFECTS, QUESTION_BY_ID, ANSWER_BY_ID, ACTION_BY_ID, migrateLegacyRegistryId, getQuestion, getAnswer, getAnswersForQuestion, getEffectsForAnswer } from './registry.js';

assert.equal(Object.keys(QUESTION_BY_ID).length, ALL_QUESTIONS.length);
assert.equal(Object.keys(ANSWER_BY_ID).length, ALL_ANSWERS.length);
assert.equal(Object.keys(ACTION_BY_ID).length, ACTIONS.length);
assert.equal(ALL_QUESTIONS.length, 97);
assert.equal(ALL_ANSWERS.length, 629);
assert.equal(ALL_EFFECTS.length, 522);
assert.equal(ACTIONS.length, 41);
assert.equal(migrateLegacyRegistryId('GEN001'), 'Q000001');
assert.equal(migrateLegacyRegistryId('GEN001.01'), 'A000001');
assert.equal(getQuestion('GEN001'), null, 'canonical runtime must not silently accept legacy question aliases');
assert.equal(getAnswer('GEN001.01'), null, 'canonical runtime must not silently accept legacy answer aliases');
assert.equal(getQuestion(migrateLegacyRegistryId('GEN001'))?.['Question ID'], 'Q000001');
assert.equal(getAnswersForQuestion('Q000001').length, 14);
assert.equal(getEffectsForAnswer('A000001').length, 0, 'general routing answers must not fabricate Effects');
assert.ok(getEffectsForAnswer('A000109').length > 0);
assert.ok(QUESTION_BY_ID.Q000077, 'orientation baseline must be present');
assert.ok(QUESTION_BY_ID.Q000092, 'all eight baseline driver discriminators must be present');
assert.ok(QUESTION_BY_ID.Q000097, 'direct state probes must be present');
assert.ok(ANSWER_BY_ID.A000592, 'question-2 cross-dimensional driver candidates must be present');
assert.ok(ANSWER_BY_ID.A000605, 'expanded bounded driver candidates must be present');
assert.ok(ANSWER_BY_ID.A000629, 'question-2 uncertainty choices must be present');
for(const qid of ['Q000085','Q000086','Q000087','Q000088','Q000089','Q000090','Q000091','Q000092']){
 const labels=getAnswersForQuestion(qid).map(a=>a.Answer);
 assert.ok(labels.includes('Not sure'),`${qid} must include Not sure`);
 assert.ok(labels.includes('None'),`${qid} must include None`);
 assert.ok(labels.includes('Something else'),`${qid} must include Something else`);
}
for(const aid of ['A000606','A000607','A000608','A000621','A000622','A000623','A000627','A000628','A000629'])assert.equal(getEffectsForAnswer(aid).length,0,`${aid} must not fabricate a driver`);
assert.ok(ACTION_BY_ID.ACT000001);
console.log('registry runtime adapter: PASS');
