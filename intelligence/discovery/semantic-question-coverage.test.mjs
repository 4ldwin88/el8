import assert from 'node:assert/strict';
import { semanticCoverage, questionRedundantWithFacts } from './semantic-question-coverage.js';
import { isQuestionEligible } from './question-eligibility.js';

const question={id:'TEST',concernId:'money_pressure',specificityLevel:1,semanticKeys:['financial.debt_burden.present']};
const state={concernId:'money_pressure',specificityFrontier:0,baselineTopics:[]};
const confirmed={f1:{factId:'f1',semanticKey:'financial.debt_burden.present',value:true,sourceType:'baseline',sourceRef:'baseline:q7',memberConfirmed:true,currentStatus:'current'}};
assert.equal(semanticCoverage(question,confirmed).complete,true);
assert.equal(questionRedundantWithFacts(question,confirmed),true);
assert.equal(isQuestionEligible(question,state,[],confirmed),false);

const weak={f1:{...confirmed.f1,memberConfirmed:false,reliability:.4}};
assert.equal(questionRedundantWithFacts(question,weak),false);
assert.equal(isQuestionEligible(question,state,[],weak),true);

const strong={f1:{...confirmed.f1,memberConfirmed:false,reliability:.8}};
assert.equal(questionRedundantWithFacts(question,strong),true);

const superseded={f1:{...confirmed.f1,currentStatus:'superseded'}};
assert.equal(questionRedundantWithFacts(question,superseded),false);

const partialQuestion={...question,semanticKeys:['financial.debt_burden.present','financial.debt_burden.impact']};
assert.deepEqual(semanticCoverage(partialQuestion,confirmed).missingKeys,['financial.debt_burden.impact']);
assert.equal(questionRedundantWithFacts(partialQuestion,confirmed),false);

console.log('semantic question coverage tests passed');
