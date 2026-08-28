import assert from 'node:assert/strict';
import { semanticCoverage, questionRedundantWithFacts } from './semantic-question-coverage.js';
import { isQuestionEligible } from './question-eligibility.js';

const question={id:'TEST',concernId:'money_pressure',specificityLevel:1,semanticKeys:['financial.debt_burden.present']};
const state={concernId:'money_pressure',specificityFrontier:0,baselineTopics:[]};
const confirmed={f1:{factId:'f1',semanticKey:'financial.debt_burden.present',value:true,sourceType:'baseline',sourceRef:'baseline:q7',memberConfirmed:true,currentStatus:'current'}};
assert.equal(semanticCoverage(question,confirmed).complete,true);
assert.equal(questionRedundantWithFacts(question,confirmed),true);
assert.equal(isQuestionEligible(question,state,[],confirmed),false);

const numericLow={f1:{...confirmed.f1,memberConfirmed:false,reliability:.4}};
assert.equal(questionRedundantWithFacts(question,numericLow),false);
assert.equal(isQuestionEligible(question,state,[],numericLow),true);

const numericHigh={f1:{...confirmed.f1,memberConfirmed:false,reliability:.99}};
assert.equal(questionRedundantWithFacts(question,numericHigh),false,'numeric reliability alone must not establish semantic authority');

const authoritative={f1:{...confirmed.f1,memberConfirmed:false,reliability:.2,authoritative:true}};
assert.equal(questionRedundantWithFacts(question,authoritative),true,'explicit authority can suppress redundant questioning regardless of a numeric score');

const validated={f1:{...confirmed.f1,memberConfirmed:false,validationStatus:'validated'}};
assert.equal(questionRedundantWithFacts(question,validated),true);

const superseded={f1:{...confirmed.f1,currentStatus:'superseded'}};
assert.equal(questionRedundantWithFacts(question,superseded),false);

const partialQuestion={...question,semanticKeys:['financial.debt_burden.present','financial.debt_burden.impact']};
assert.deepEqual(semanticCoverage(partialQuestion,confirmed).missingKeys,['financial.debt_burden.impact']);
assert.equal(questionRedundantWithFacts(partialQuestion,confirmed),false);

console.log('semantic question coverage authority tests passed');
