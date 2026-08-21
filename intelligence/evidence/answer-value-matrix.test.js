import assert from 'node:assert/strict';
import {emotionalQuestions} from '../question-bank/emotional.js';
import {financialQuestions} from '../question-bank/financial.js';
import {answerValueMatrix,attachAnswerEvidence,matrixCoverage} from './answer-value-matrix.js';
import {resolveAnswerEvidence,applyAnswerEvidence,informationGain} from './answer-evidence.js';

const questions=[...emotionalQuestions,...financialQuestions];
const coverage=matrixCoverage(questions);
const missing=coverage.filter(x=>x.mapped!==x.options);
assert.deepEqual(missing,[],`unmapped answer options: ${JSON.stringify(missing)}`);
assert.equal(Object.keys(answerValueMatrix).length,questions.length);

// Every bank question should become evidence-capable without mutating its selection metadata.
for(const q of questions){
  const enriched=attachAnswerEvidence(q);
  assert.ok(enriched.answer_evidence);
  assert.equal(enriched.information_value,q.information_value);
  assert.equal(enriched.burden,q.burden);
}

// Strongly informative answers should create substantially more realized information gain than Unsure.
{
  const q=attachAnswerEvidence(financialQuestions.find(x=>x.id==='fin_cashflow_v1'));
  const before={uncertaintyBySignal:{cashflow_after_essentials:1}};
  const strong=applyAnswerEvidence(before,resolveAnswerEvidence(q,'Significantly short'));
  const uncertain=applyAnswerEvidence(before,resolveAnswerEvidence(q,'Unsure'));
  assert.ok(informationGain(before,strong)>informationGain(before,uncertain)*5);
  assert.ok(strong.dimensionEvidence.Financial.net<0);
}

// Cross-dimensional options should actually propagate beyond the primary dimension.
{
  const q=attachAnswerEvidence(financialQuestions.find(x=>x.id==='fin_obligations_v1'));
  const after=applyAnswerEvidence({uncertaintyBySignal:{essential_obligation_pressure:1}},resolveAnswerEvidence(q,['Housing risk','Food affordability']));
  assert.ok(after.dimensionEvidence.Financial.net<0);
  assert.ok(after.dimensionEvidence.Environmental.net<0);
  assert.ok(after.dimensionEvidence.Physical.net<0);
}

console.log(`answer-value matrix coverage passed: ${coverage.length} questions, ${coverage.reduce((n,x)=>n+x.mapped,0)} answer options mapped`);
