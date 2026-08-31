import assert from 'node:assert/strict';
import {QUESTION_BANK,QUESTION_BY_ID} from './questionBank.js';
import {ANSWER_BANK,ANSWER_BY_ID,ANSWERS_BY_QUESTION,ANSWER_CANDIDATES} from './answerBank.js';

assert.equal(Object.keys(QUESTION_BY_ID).length,QUESTION_BANK.length,'duplicate governed question ID');
assert.equal(Object.keys(ANSWER_BY_ID).length,ANSWER_BANK.length,'duplicate runnable answer ID');

for(const question of QUESTION_BANK){
  assert.ok(question.id, 'question missing id');
  assert.ok(question.text, `${question.id} missing text`);
  assert.ok(question.role, `${question.id} missing role`);
  assert.ok(question.responseType, `${question.id} missing response type`);
  const answers=ANSWERS_BY_QUESTION[question.id]??[];
  if(question.status!=='design-only'&&question.status!=='deferred')assert.ok(answers.length>0,`${question.id} has no runnable answers`);
  for(const answer of answers)assert.equal(answer.parentId,question.id,`${answer.id} parent mismatch`);
}

for(const answer of ANSWER_BANK){
  assert.ok(QUESTION_BY_ID[answer.parentId],`${answer.id} is an orphan runnable answer`);
  assert.ok(answer.text,`${answer.id} missing text`);
  assert.ok(answer.effect&&typeof answer.effect==='object',`${answer.id} missing governed effect semantics`);
}
for(const candidate of ANSWER_CANDIDATES)assert.equal(candidate.runnable,false,`${candidate.id} candidate leaked into runtime`);

const requiredDomainAnchors=['GEN001','PHY001','EMT001','FIN001','INT001','OCC001','SOC001','ENV001','SPI001'];
for(const id of requiredDomainAnchors)assert.ok(QUESTION_BY_ID[id],`missing governed domain anchor ${id}`);
assert.equal(QUESTION_BY_ID.SAF001?.status,'design-only','Safety question must remain design-only');
assert.equal(ANSWER_CANDIDATES.some(x=>x.id==='XDM001.02'),true,'cross-dimensional candidate missing');
assert.equal(ANSWER_CANDIDATES.some(x=>x.id==='XDM001.04'),true,'cross-dimensional candidate missing');

console.log(`Governed Discovery registry valid: ${QUESTION_BANK.length} questions, ${ANSWER_BANK.length} runnable answers, ${ANSWER_CANDIDATES.length} non-runnable candidates.`);
