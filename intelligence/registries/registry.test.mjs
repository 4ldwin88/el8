import assert from 'node:assert/strict';
import { QUESTIONS, ANSWERS, EFFECTS, ACTIONS } from './index.js';
import { QUESTION_BY_ID, ANSWER_BY_ID, ACTION_BY_ID, resolvePermanentId, getAnswersForQuestion, getEffectsForAnswer } from './registry.js';

assert.equal(Object.keys(QUESTION_BY_ID).length, QUESTIONS.length);
assert.equal(Object.keys(ANSWER_BY_ID).length, ANSWERS.length);
assert.equal(Object.keys(ACTION_BY_ID).length, ACTIONS.length);
assert.equal(QUESTIONS.length, 76);
assert.equal(ANSWERS.length, 506);
assert.equal(EFFECTS.length, 398);
assert.equal(ACTIONS.length, 41);
assert.equal(resolvePermanentId('GEN001'), 'Q000001');
assert.equal(resolvePermanentId('GEN001.01'), 'A000001');
assert.equal(getAnswersForQuestion('Q000001').length, 14);
assert.equal(getEffectsForAnswer('A000001').length, 0, 'general routing answers must not fabricate Effects');
assert.ok(getEffectsForAnswer('A000109').length > 0);
assert.ok(ACTION_BY_ID.ACT000001);
console.log('registry runtime adapter: PASS');
